marketStats.core = class {
  constructor(saveURL) {
    this.statCodeInfo = ""; // an area code provide by statsCentre, data is stored in MYSQL table: wp_pid_stats_code
    this.areaCode = "";
    this.propertyType = ""; // for get stat data
    this.dwellingType = "Single House"; // for update the pid reports
    this.deleteOldData = false;
    this.error = new Error(ERROR_MESSAGE_NO_ERROR);
    this.areaQuantityEveryUpdate = 1;
    this.statsPeriodLength = StatsPeriod.max_update; // 1:: 24 months; 3:: 48 months
    this.selectedOptions = {
      calc: "monthly",
      dq: "5035#0=|", // area code(statCode) + group code
      m: "hpi",
      min: 1,
      period: this.statsPeriodLength, // fetch 4 years / 48 months stats
      view: "100",
    };
    this.globalRequestParams = GlobalRequestParams;
    this.noDataAreaCodes = [];

    this.updateServerURLs("local"); // set to local server urls by default

    this.statCode = { search: this.searchStatCode, update: this.updateStatCode };
    this.statDatePointers = { update: this.updateStatDatePointers };
    this.statData = {
      save: this.saveStatData,
      request: this.requestStatData,
      update: {
        specificSingleGroup: this.updateSpecGroupStats,
        specificAreaFourGroups: this.updateSpecAreaStats,
        monthlyStats: this.updateMonthlyStats,
      },
    };
    this.statReport = {
      update: {
        reMarketPivot: this.updateREMarketPivot,
        reMarketMonthly: this.updateREMarketMonthlyReportData,
      },
    };

    // read monthly update status:
    chrome.storage.local.get(["iAreaCodePointer", "areaQuantityEveryUpdate"], (xInfo) => {
      this.iAreaCodePointer = xInfo.iAreaCodePointer;
      this.areaQuantityEveryUpdate = xInfo.areaQuantityEveryUpdate
        ? xInfo.areaQuantityEveryUpdate
        : this.areaQuantityEveryUpdate;
    });
  }

  updateSpecGroupStats = marketStats.core.updateSpecGroupStats;
  updateSpecAreaStats = marketStats.core.updateSpecAreaStats;
  updateMonthlyStats = marketStats.core.updateMonthlyStats;
  searchStatCode = marketStats.core.searchStatCode;
  requestStatData = marketStats.core.requestStatData;
  saveStatData = marketStats.core.saveStatData;
  updateStatCode = marketStats.core.updateStatCode;
  updateStatDatePointers = marketStats.core.updateStatDatePointers;
  updateREMarketPivot = marketStats.core.updateREMarketPivot;
  updateREMarketMonthlyReportData = marketStats.core.updateREMarketMonthlyReportData;
  updateServerURLs = marketStats.core.updateServerURLs;
  setReportDwellingType = marketStats.core.setReportDwellingType;
  copyTextToClipboard = marketStats.core.copyTextToClipboard;
};

//- 功能: update the stats data for a specific group of one selected Area
// statDataPeriod: 数据的数量, 一般取过去3年的数据
// areaCode: 社区的代码, 例如F10, F20, VBU等等
// groupCode: 数据的类别/组别, 例如HPI, Sale/Active Ratio等等
marketStats.core.updateSpecGroupStats = async function (statDataPeriod, areaCode, groupCode) {
  let propertyType = GetPropertyType(groupCode);
  let statData;
  console.group(`Update Spec Group[${propertyType}<${groupCode}>] of Area [${areaCode}]`);
  // 1. get statCode from MySQL Database table
  try {
    this.statCodeInfo = await this.searchStatCode(areaCode, groupCode);
    // if statCodeInfo.groupCode is true, go to update stat data
    // otherwise, bypass this groupCode and go to next groupCode
    if (this.statCodeInfo[propertyType] === "0") {
      console.warn(`${areaCode} ${propertyType} BYPASS STAT DATA Request`);
      console.groupEnd();
      return;
    }
  } catch (err) {
    this.error = err;
    console.groupEnd();
    return;
  }

  // 2. get the statData from stats Centre API
  try {
    this.areaCode = areaCode;
    this.selectedOptions.dq = this.statCodeInfo.stat_code + groupCode;
    this.selectedOptions.period = statDataPeriod;
    //- 请求某一个社区(areacode)的某一组数据
    statData = await this.requestStatData(this.selectedOptions, this.globalRequestParams);
  } catch (err) {
    //- 这里是最底层的数据请求错误
    this.error = err.err; // error object被包装在err.err这个property里面
    console.error(`${areaCode} - ${err.areaName}: ${groupCode}, ${err.err.message}`);
    this.noDataAreaCodes.push({
      areaCode: areaCode,
      areaName: err.areaName,
      groupCode: groupCode,
      propertyType: err.propertyType,
      message: err.err.message,
    });
    // if err.message === NO_DATA
    // update backend MySQL Table wp_pid_stat_code groupCode to 0
    if (this.statCodeInfo[propertyType] && err.message === ERROR_MESSAGE_NO_STAT_DATA) {
      //- 不再更改这个状态标记 @2022-09-11
      //- this.updateStatCode(areaCode, propertyType, false);
    }
    console.groupEnd();
    throw err;
  }

  // 3. save the statData to MySql Database
  try {
    let saveDataResult = await this.saveStatData(statData);
    console.log(saveDataResult);
  } catch (err) {
    this.error = err;
    console.error(areaCode, groupCode, err);
    console.groupEnd();
    throw err;
  }

  console.groupEnd();

  return statData;
};

//- stat data Update for all 4 groups of a specific areaCode
marketStats.core.updateSpecAreaStats = async function (statDataPeriod, areaCode) {
  let statData;
  console.group(`Specific Area:${areaCode} DataPeriod:${statDataPeriod} All Groups - Update Button Clicked`);

  this.error = new Error(ERROR_MESSAGE_NO_ERROR);
  for (let index = 0; index < GroupCodes.length; index++) {
    let groupCode = GroupCodes[index];
    try {
      statData = await this.updateSpecGroupStats(statDataPeriod, areaCode, groupCode);
    } catch (err) {
      console.log(`${err.err.message}`);
    }
  }
  console.log(`%cSpecific Area: ${areaCode} REBGV Data UPDATE Done!`, "background: #76ff7a; color: #648c11");
  console.groupEnd();

  return statData;
};

//- NEW stat data monthly update
marketStats.core.updateMonthlyStats = function (statDataPeriod) {
  console.log("Monthly Update Button Clicked");
  let i = 0;
  let iAreaCodePointer = 0;
  let areaQuantityEveryUpdate = parseInt($("#pid_area_quantity_every_update").val());
  areaQuantityEveryUpdate = areaQuantityEveryUpdate ? areaQuantityEveryUpdate : 1;

  // 1. get the current iAreaCodePointer from chrome.storage.local
  // 2. start monthly stats update process
  chrome.storage.local.get(["iAreaCodePointer"], (res) => startMonthlyUpdates.call(this, res));

  async function startMonthlyUpdates(xInfo) {
    iAreaCodePointer = xInfo.iAreaCodePointer ? xInfo.iAreaCodePointer : 0; // use to control the loop
    let statData;
    let areaCode = AreaCodes[i];
    this.error = new Error(ERROR_MESSAGE_NO_ERROR);

    // loop all AreaCodes
    for (let j = 0; j < areaQuantityEveryUpdate; j++) {
      areaCode = AreaCodes[iAreaCodePointer + j]; // j is used to move areaCode pointer, i is the base areaCode Pointer
      // Loop: go for next areaCode
      console.group(`AreaCode ${areaCode} Loop:#${j + 1} of ${areaQuantityEveryUpdate}`);
      //loop all groups
      try {
        statData = await this.updateSpecAreaStats(statDataPeriod, areaCode);
      } catch (err) {
        console.log(err.err?.message);
      }

      // if (statData.err.message === ERROR_MESSAGE_NO_ERROR || statData.err.message.indexOf("Fatal") === -1) {
      // if there is no fatal errors, set next iAreaCodePointer to chrome local storage
      let saveAreaPointerResult = await chrome.storage.local.set({ iAreaCodePointer: iAreaCodePointer + 1 + j });
      console.log(`区域指针iAreaCodePointer已经保存到LocalStorge:${saveAreaPointerResult}`);
      // update the button message
      this.iAreaCodePointer++;
      let htmlButtonUpdate = $("#pid_update_stat");
      htmlButtonUpdate.val(`Monthly Update (${this.iAreaCodePointer} | ${AreaCodes.length})`);
      // }
      console.groupEnd();
    }
    console.log("%cStats Data Request Task All Done!", "background: #76ff7a; color: #648c11");
    console.log(this.noDataAreaCodes);
  }
};

marketStats.core.searchStatCode = async function (areaCode, groupCode = "") {
  let statCode;
  // Translate the StatsCentre group code to Property type
  this.propertyType = GetPropertyType(groupCode);

  var AreaCodeInfo = {
    areaCode: areaCode,
    propertyType: this.propertyType,
    url: this.searchStatCodeURL,
    action: "Search Stat Code",
  };

  try {
    let statCodeInfo = await chrome.runtime.sendMessage(AreaCodeInfo);
    statCode = statCodeInfo.stat_code;
    // normalize the statCode

    if (typeof statCode === "string") {
      statCode = statCode.replace(/[\W_]+/g, ""); // remove all non-word character[^a-zA-Z0-9_] and '_' from the result
    } else {
      statCode = statCode;
    }
    // return promise value
    return Promise.resolve(statCodeInfo);
  } catch (err) {
    // catch errors
    console.error(`searchStatCode Failed:${areaCode}, ${groupCode}, ${err}`);
    return Promise.reject(err);
  }
};

//- 功能: 数据请求和数据处理
//- 错误信息包含在返回数据包的err属性里面
marketStats.core.requestStatData = async function (selectedOptions, globalRequestParams) {
  var requestData;
  var currentDataRequest;

  requestData = $.extend(
    {
      op: "d",
    },
    selectedOptions,
    globalRequestParams
  );
  // Initial send request
  let statInfo;
  // Per Request_Tries, if stats data is not correct try once more
  for (let i = 0; i <= REQUEST_TRIES; i++) {
    //- 如果是第二次尝试, 等待3秒钟再试:
    if (i > 0) {
      let localWait = await marketStats.util.sleep(3000); // 等待3秒钟
    }
    try {
      //- 本来无法使用fetch获取数据, 根据对比ajaxCall和fetch的HTTP数据包的差异, 调整成一样的参数
      //- 现在fetch已经可以正常使用了. 不过似乎获取数据的失败几率比较高
      statInfo = await marketStats.core.fetchStatData(requestData, currentDataRequest);
      // statInfo = await marketStats.core.ajaxStatDataPromise.call(this, requestData, currentDataRequest);
    } catch (err) {
      // fatal errors:
      console.log("ProcessDataRequest Fatal Error:", err.message);
      //- 把statInfo更改成一个err对象
      statInfo = new Error(ERROR_MESSAGE_DATA_FATAL);
    }

    //- 函数处理的错误信息包含在返回的数据包statInfo.err里面
    statInfo = await marketStats.core.processStatData.call(this, statInfo.Payload);

    if (statInfo.status === "OK") {
      // Stat Data Request and Process Succeed
      return Promise.resolve(statInfo);
    } else {
      if (statInfo.status === "NO_DATA" || statInfo.status === "NO_STATS_DATA") {
        if (i === REQUEST_TRIES - 1) {
          //- 多次数据请求失败, 返回调用函数:
          console.log(`Last DataRequest Try:`, statInfo.err.message);
          return Promise.reject(statInfo);
        } else {
          //- 本次数据请求失败, 再试一次:
          console.log(`[${i + 1}] Try More Requests:`, statInfo.err.message);
        }
      } else {
        return Promise.reject(statInfo);
      }
    }
  }
};

marketStats.core.saveStatData = async function (statDataInfo) {
  if (!statDataInfo.statData) {
    console.log("stat read error!");
    return;
  }
  let saveStatDataResult = await chrome.runtime.sendMessage(statDataInfo);
  return Promise.resolve(saveStatDataResult);
};

marketStats.core.updateStatCode = async function (areaCode, propertyType, hasStatData) {
  let statCodeInfo = {
    areaCode: areaCode,
    propertyType: propertyType,
    hasStatData: hasStatData,
    url: this.updateStatCodeURL,
    action: "Update Stat Code",
  };
  let updateStatDataResult = await chrome.runtime.sendMessage(statCodeInfo);
  return Promise.resolve(updateStatDataResult);
};

// UPDATE STAT DATE POINTERS
marketStats.core.updateStatDatePointers = async function (
  current_year_month_day,
  previous_year_month_day,
  start_year_month_day
) {
  let statDatePointersInfo = {
    datePointer1: current_year_month_day,
    datePointer2: previous_year_month_day,
    datePointer3: start_year_month_day,
    url: this.updateStatDatePointersURL,
    action: "Update Stat Date Pointers",
  };
  let updateStatDatePointersResult = await chrome.runtime.sendMessage(statDatePointersInfo);
  return Promise.resolve(updateStatDatePointersResult);
};

// UPDATE / PIVOT THE STAT DATA TO WP_PID_MARKET_PIVOT
marketStats.core.updateREMarketPivot = async function (
  current_year_month_day,
  previous_year_month_day,
  start_year_month_day
) {
  let statDataPivotInfo = {
    datePointer1: current_year_month_day,
    datePointer2: previous_year_month_day,
    datePointer3: start_year_month_day,
    url: this.updateREMarketPivotURL,
    dwellingType: this.dwellingType,
    action: "Update RE Market Pivot Table",
  };
  let updateStatDataPivotResult = await chrome.runtime.sendMessage(statDataPivotInfo);
  return Promise.resolve(updateStatDataPivotResult);
};

// UPDATE RE MARKET MONTHLY REPORT DATA TO WP_PID_MARKET_MONTHLY_REPORT
marketStats.core.updateREMarketMonthlyReportData = async function (
  current_year_month_day,
  previous_year_month_day,
  start_year_month_day
) {
  let monthlyReportDataPivotInfo = {
    datePointer1: current_year_month_day,
    datePointer2: previous_year_month_day,
    datePointer3: start_year_month_day,
    dwellingType: this.dwellingType,
    url: this.updateREMarketMonthlyReportURL,
    action: "Update RE Market MONTHLY REPORT Table", // WP_PID_MARKET_MONTHLY_REPORT
  };
  let updateMonthlyReportDataResult = await chrome.runtime.sendMessage(monthlyReportDataPivotInfo);
  return Promise.resolve(updateMonthlyReportDataResult);
};

// Update Server URLs
marketStats.core.updateServerURLs = function (serverLocation) {
  switch (serverLocation.toLowerCase()) {
    case "local":
      this.saveURL = SAVE_URL_LOCAL; // save the stat data to wp_pid_market locally
      this.searchStatCodeURL = SEARCH_URL_STAT_CODE_LOCAL;
      this.updateStatCodeURL = UPDATE_URL_STAT_CODE_LOCAL;
      this.updateStatDatePointersURL = UPDATE_URL_STAT_DATE_POINTERS_LOCAL;
      this.updateREMarketPivotURL = UPDATE_URL_RE_MARKET_PIVOT_LOCAL;
      this.updateREMarketMonthlyReportURL = UPDATE_URL_RE_MARKET_MONTHLY_REPORT_LOCAL;
      console.log(`Change Server URL to Local : ${SAVE_URL_LOCAL}`);
      break;
    case "remote":
      this.saveURL = SAVE_URL_REMOTE; // save the stat data to wp_pid_market live (remote)
      this.searchStatCodeURL = SEARCH_URL_STAT_CODE_REMOTE;
      this.updateStatCodeURL = UPDATE_URL_STAT_CODE_REMOTE;
      this.updateStatDatePointersURL = UPDATE_URL_STAT_DATE_POINTERS_REMOTE;
      this.updateREMarketPivotURL = UPDATE_URL_RE_MARKET_PIVOT_REMOTE;
      this.updateREMarketMonthlyReportURL = UPDATE_URL_RE_MARKET_MONTHLY_REPORT_REMOTE;
      console.log(`Change Server URL to Remote : ${SAVE_URL_REMOTE}`);
      break;
  }
};

// Set Report Dwelling Type As Per Selection From UI
marketStats.core.setReportDwellingType = function (dwellingType) {
  this.dwellingType = dwellingType;
};

marketStats.core.copyTextToClipboard = function (text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log("Async: Copying to clipboard was successful!");
    },
    function (err) {
      console.log("Async: Could not copy text: ", err);
    }
  );
};

// Promise Wrapper for ajax call
// Fetch Stat Data from Stats Centre API
marketStats.core.ajaxStatDataPromise = function (requestData, currentDataRequest) {
  if (currentDataRequest) currentDataRequest.abort();
  const backendDataUrl = "/infoserv/sparks";
  let moreDataParts = [];

  let ajaxCall = new Promise((res, rej) => {
    currentDataRequest = $.ajax({
      type: "POST",
      url: backendDataUrl,
      dataType: "json",
      data: requestData,
      async: true, //enable/disable async ajax call
      success: (data, textStatus, jqXHR) =>
        marketStats.core.ajaxResolve(data, textStatus, jqXHR, requestData, moreDataParts, res),
      error: (jqXHR, textStatus, error) =>
        marketStats.core.ajaxReject(jqXHR, textStatus, error, requestData, moreDataParts, rej),
    });
  });

  return ajaxCall;
};

marketStats.core.ajaxResolve = async function (data, textStatus, jqXHR, requestData, moreDataParts, res) {
  if (data.ResponseType === "MULTIPART") {
    var nextPart = data.TotalParts - data.RemainingParts;

    for (let i = data.RemainingParts; i > 0; i--) {
      console.warn(`${MORE_DATA_REMAINING}: ${data.RemainingParts}`);

      var newRequestData = $.extend(
        {
          nxt: nextPart,
          rid: data.ResponseID,
        },
        requestData
      );

      // Send request for more data
      moreDataParts = moreDataParts.concat(data.Payload);
      let moreDataPart = await marketStats.core.ajaxStatDataPromise(newRequestData);
      moreDataParts = moreDataParts.concat(moreDataPart.Payload);
      // RemainingParts will passed from the inner call, its state is used to break the Loop
      if (moreDataPart.RemainingParts === 0) {
        data.Payload = moreDataParts;
        break;
      }
    }
    // resolve the assembled data
    res(data);
  }
};

// Function for handling fatal error
marketStats.core.ajaxReject = function (jqXHR, textStatus, error, requestData, moreDataParts, rej) {
  if (textStatus !== "abort") {
    var response = jQuery.parseJSON(jqXHR.responseText);
    let errMsg = ERROR_MESSAGE_DATA_FATAL;
    let err = new Error(errMsg);
    rej(err); // to do list: no callback any more
  }
};

//- 无法工作, Stats Center服务器返回Status Code: http 500 Internal Server Error
marketStats.core.fetchStatData = async function (requestData, currentDataRequest) {
  const options = {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "application/json, text/javascript, */*; q=0.01",
    },
    body: marketStats.util.serialize(requestData),
  };
  // const url =
  //   "http://localhost/pidrealty4/wp-content/themes/realhomes-child-3/db/data.php";
  const url = "/infoserv/sparks";
  try {
    const res = await fetch(url, options);
    const statCode = await res.json();
    if (!!statCode.Errors && statCode.Errors[0].Message === "System Error") {
      return Promise.rejct(new Error("System Error"));
    } else {
      return Promise.resolve(statCode);
    }
  } catch (err) {
    let error = { stat_code: null, message: err.message };
    return Promise.reject(error);
  }
};

// Process Stat Data
marketStats.core.processStatData = function (statDataParts) {
  let statDataInfo;

  // check if statInfoTemp contains data: status "OK" or "NO_DATA"?
  // status is inside Type: "SERIES_DATA"
  // 4 Types are: "SERIES_DATA","SERIES_CATEGORIES","DATA_PARTS","QUICKSTATS"
  // Loop to get Type SERIES_DATA
  let SERIES_DATA = statDataParts.filter((statItem) => statItem.Type === "SERIES_DATA");
  let QuickStats = statDataParts.filter((statItem) => statItem.Type === "QUICKSTATS");
  let areaCodeAndName = QuickStats[0]?.BreakoutHeader;
  // data status should be "OK" for a normal request
  let status = SERIES_DATA.length > 0 ? SERIES_DATA[0].Status : ERROR_MESSAGE_NO_STAT_DATA;
  let areaName = SERIES_DATA.length > 0 ? SERIES_DATA[0].Name : areaCodeAndName;
  let seriesData = SERIES_DATA.length > 0 ? SERIES_DATA[0].Data : [];
  // precess the data payload
  // contains 4 arrays - normal state
  // contains 2 arrays - if no summary data, normal state
  // contains 2 arrays - but only summary data, error occurs
  let returnDataLength = statDataParts.length;
  statDataInfo = {
    saveData: true,
    areaCode: this.areaCode,
    propertyType: this.propertyType,
    saveURL: this.saveURL,
    statData: statDataParts, // wrap stat data
    deleteOldData: this.deleteOldData,
    action: "Save Stat Data",
    status: status,
    areaName: areaName,
    err: new Error(ERROR_MESSAGE_NO_ERROR),
  };
  console.log(statDataInfo.propertyType, areaName, status, seriesData);

  return new Promise((res, rej) => {
    if (
      ((returnDataLength === 2 && statDataParts[1].Type === "SERIES_DATA") || returnDataLength === 4) &&
      status === "OK"
    ) {
      console.log(MSG_CORRECT_STAT_DATA);
      //- 返回的数据包里面包含一个err对象, ERROR_MESSAGE_NO_ERROR
      res(statDataInfo); // resolved promise
    } else {
      // server does not return correct stats data
      // do not send reject error info, try again
      if (status === "NO_DATA" || status === "NO_STATS_DATA") {
        //- 这是最底层的数据请求错误
        statDataInfo.err = new Error(ERROR_MESSAGE_NO_STAT_DATA);
        console.warn(`${statDataInfo.areaName} - ${statDataInfo.propertyType}: ${statDataInfo.err.message}`);
        res(statDataInfo);
      }
    }
  });
};
