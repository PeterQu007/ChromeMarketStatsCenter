marketStats.ui = class {
  constructor() {
    this.htmlDiv = $("#infosparksTarget");
    this.htmlDivQuickStats = $("div.quickStats");
    this.htmlFooter = $("footer");
    this.htmlAcInput = $(`div.inputWrap input.acInput`)[0];
    this.htmlFooter.remove(); // remove the footer to increase visibility of useful contents

    this.util = marketStats.util;

    // set up date pointers for wp_pid_stat_date_pointer table
    this.currentYearMonthDay = this.util.getYearMonthDay(1);
    this.previousYearMonthDay = this.util.getYearMonthDay(2);
    this.startYearMonthDay = this.util.getYearMonthDay(3);
    this.secondLastYearMonthDay = this.util.getYearMonthDay(4);
    this.startPreviousYearMonthDay = this.util.getYearMonthDay(2, this.util.startYearMonthDay);
    this.startSecondLastYearMonthDay = this.util.getYearMonthDay(4, this.util.startYearMonthDay);

    // Set Data Period
    this.dataPeriod = StatsPeriod.max_update;
    // Add Core Functionality to the Class
    this.mscore = new marketStats.core(SAVE_URL_LOCAL);

    // read monthly update status:
    chrome.storage.local.get(["iAreaCodePointer", "areaQuantityEveryUpdate"], (xInfo) => {
      this.iAreaCodePointer = xInfo.iAreaCodePointer;
      this.areaQuantityEveryUpdate = xInfo.areaQuantityEveryUpdate
        ? xInfo.areaQuantityEveryUpdate
        : this.areaQuantityEveryUpdate;
    });

    //- 等待DOM完成表达
    //- Monitor the DOM Tree of the main page of Stats Center
    $("body").on("DOMSubtreeModified", "div.quickStats", (e) => {
      // -Turn off the event listener
      $("body").off("DOMSubtreeModified", "div.quickStats");
      // Add user interface:
      this.setup();
      // Add events to the Controls:
      this.addEventHandlers();
    });
  }

  setup = marketStats.ui.setup;
  addEventHandlers = marketStats.ui.addEventHandlers;
};

marketStats.ui.setup = function () {
  // Add extension UI components after the div.quickStats container is ready
  if (!this.htmlDivQuickStats || this.htmlDivQuickStats.length == 0) {
    this.htmlDivQuickStats = $(`div.quickStats`);
  }
  let htmlAreaLabel = $(`<h5 id="pid_areaLabel">Area Name</h5>`);
  let htmlDivRadios = $(`<div id="pid_save_radios" style="display: block"></div>`);
  let htmlSaveForm = $(`<form name="pidSaveForm" style="display:block"></form`);
  let htmlSaveFieldSet = $(`<fieldset style="display: inline-block"></fieldset>`);
  let htmlRadioLocal = $(
    `<input type="radio" id="pid_save_stat_local" class="SaveRadios" name="SaveRadios" value="save local" checked="checked">
         <label for="pid_save_stat_local" class="SaveRadios">Save Local</label>
        `
  );
  let htmlRadioRemote = $(
    `<input type="radio" id="pid_save_stat_remote" class="SaveRadios" name="SaveRadios" value="save remote">
         <label for="pid_save_stat_remote" class="SaveRadios">Save Remote</label>
        `
  );
  let htmlCheckboxStop = $(
    `<input type="checkbox" id="pid_update_stat_stop" class="stopUpdateStats" name="StopUpdateStats" value="StopUpdateStats">
         <label for="pid_update_stat_stop" class="stopUpdateStats">Stop Monthly Update</label>
        `
  );
  // option: delete old data or not
  let htmlCheckboxReloadData = $(
    `<input type="checkbox" id="pid_reload_stats" class="stopUpdateStats" name="ReloadStats" value="ReloadStats">
         <label for="pid_reload_stats" class="stopUpdateStats">Reload Stats</label>
        `
  );
  // option: data periods 1, 3, 5, 10 years
  let htmlDropdownDataPeriods = $(
    `
        <label for="pid_data_periods" class="dataPeriods">Data Periods (Years)</label>
        <select id="pid_data_periods">
          <option value = "1">1 Year</option>
          <option value = "3">3 Year</option>
          <option value = "5">5 Year</option>
          <option value = "10">10 Year</option>
          <option value = "100">Max</option>
        </select>
        `
  );
  // option: monthly updates start over, set pointer to 0
  let htmlResetAreaPointer = $(`<input type="button" id="pid_reset_area_pointer" value="Reset Area Pointer">`);
  let htmlResetAreaPointerNumber = $(`<input type="text" id="pid_reset_area_point_number" value="0">`);
  // option: set area quantity for every update
  let htmlAreaQuantityEveryUpdate = $(
    `<input type="text" id="pid_area_quantity_every_update" value=${this.areaQuantityEveryUpdate}>`
  );

  // option: The month of stat data updating

  let optionElements = "";
  let optionYearMonthDay = "";
  for (let i = 0; i <= 12; i++) {
    optionYearMonthDay = this.util.getYearMonthDay_new(i);
    optionElements += `<option value = "${optionYearMonthDay}">${optionYearMonthDay}</option>`;
  }

  let htmlMonthUpdating = $(
    `
        <label for="pid_data_month_of_updating" class="dataPeriods">The Month of Updating</label>
        <select id="pid_data_month_of_updating">
          ${optionElements}
        </select>
        `
  );

  // option for property type
  let htmlRadioPropertyTypeSHS = $(
    `<input type="radio" id="pid_property_type_option_SHS" class="PropertyTypes" name="PropertyTypes" value="Single House" checked="checked">
         <label for="pid_property_type_option_SHS" class="SaveRadios">Single House</label><br>
        `
  );
  let htmlRadioPropertyTypeTHS = $(
    `<input type="radio" id="pid_property_type_option_THS" class="PropertyTypes" name="PropertyTypes" value="Town House">
         <label for="pid_property_type_option_THS" class="SaveRadios">Town House</label><br>
        `
  );
  let htmlRadioPropertyTypeAPT = $(
    `<input type="radio" id="pid_property_type_option_APT" class="PropertyTypes" name="PropertyTypes" value="Apartment">
         <label for="pid_property_type_option_APT" class="SaveRadios">Apartment</label><br>
        `
  );
  let htmlRadioPropertyTypeALL = $(
    `<input type="radio" id="pid_property_type_option_ALL" class="PropertyTypes" name="PropertyTypes" value="All Types">
         <label for="pid_property_type_option_ALL" class="SaveRadios">All Types</label>
        `
  );

  // buttons

  let htmlButtonAll = $(`<input type="button" id="pid_read_stat_All" value="Read All">`);
  let htmlButtonDetached = $(`<input type="button" id="pid_read_stat_Detached" value="Read Detached">`);
  let htmlButtonTownhouse = $(`<input type="button" id="pid_read_stat_Townhouse" value="Read Townhouse">`);
  let htmlButtonCondo = $(`<input type="button" id="pid_read_stat_Condo" value="Read Condo">`);
  let htmlButtonAllGroups = $(`<input type="button" id="pid_read_stat_All_Groups" value="Read All 4 Groups">`);
  let htmlButtonUpdate = $(
    `<input type="button" id="pid_update_stat" value="Monthly Update (${this.iAreaCodePointer} | ${AreaCodes.length})">`
  );
  let htmlButtonUpdateDatePointer = $(
    `<input type="button" id="pid_update_stat_date_point" value="Update Date Pointer">`
  );
  let htmlButtonPivotStatData = $(`<input type="button" id="pid_pivot_stat_data" value="Pivot Stat Data">`);
  let htmlButtonMonthlyReportData = $(`<input type="button" id="pid_monthly_report_data" value="Monthly Report Data">`);

  if ($("#pid_save_radios").length == 0) {
    let htmlFormRow1 = $(`<div class = "formrow"></div>`);
    htmlFormRow1.append(htmlRadioLocal);
    htmlSaveFieldSet.append(htmlFormRow1);
    let htmlFormRow2 = $(`<div class = "formrow"></div>`);
    htmlFormRow2.append(htmlRadioRemote);
    htmlSaveFieldSet.append(htmlFormRow2);
    let htmlFormRow3 = $(`<div class = "formrow"></div>`);
    htmlFormRow3.append(htmlCheckboxStop);
    htmlSaveFieldSet.append(htmlFormRow3);
    let htmlFormRow4 = $(`<div class = "formrow"></div>`);
    htmlFormRow4.append(htmlCheckboxReloadData);
    htmlSaveFieldSet.append(htmlFormRow4);
    let htmlFormRow5 = $(`<div class = "formrow"></div>`);
    htmlFormRow5.append(htmlDropdownDataPeriods);
    htmlSaveFieldSet.append(htmlFormRow5);

    let htmlFormRow6 = $(
      `<div class = "formrow"><label for='pid_area_quantity_every_update' title='Press Enter to Save!'>Update # every time</label></div>`
    );
    htmlFormRow6.append(htmlAreaQuantityEveryUpdate);
    htmlSaveFieldSet.append(htmlFormRow6);
    let htmlFormRow7 = $(
      `<div class = "formrow"><label for='pid_reset_area_point_number'>Reset to AreaPointer #<label></div>`
    );
    htmlFormRow7.append(htmlResetAreaPointerNumber);
    htmlSaveFieldSet.append(htmlFormRow7);
    let htmlFormRow8 = $(`<div class = "formrow"></div>`);
    htmlFormRow8.append(htmlResetAreaPointer);
    htmlSaveFieldSet.append(htmlFormRow8);
    let htmlFormRow9 = $(`<div class = "formrow"></div>`);
    htmlFormRow9.append(htmlMonthUpdating);
    htmlSaveFieldSet.append(htmlFormRow9);

    // Add property type radios
    let htmlFormRow10 = $(`<div class = "formrow"></div>`);
    htmlFormRow10.append($(`<hr>`));
    htmlFormRow10.append(htmlRadioPropertyTypeSHS);
    htmlFormRow10.append(htmlRadioPropertyTypeTHS);
    htmlFormRow10.append(htmlRadioPropertyTypeAPT);
    htmlFormRow10.append(htmlRadioPropertyTypeALL);
    htmlSaveFieldSet.append(htmlFormRow10);

    htmlSaveForm.append(htmlSaveFieldSet);
    htmlDivRadios.append(htmlAreaLabel);
    htmlDivRadios.append(htmlSaveForm);
    this.htmlDivQuickStats.append(htmlDivRadios);

    this.htmlDivQuickStats.append(htmlButtonAll);
    this.htmlDivQuickStats.append(htmlButtonDetached);
    this.htmlDivQuickStats.append(htmlButtonTownhouse);
    this.htmlDivQuickStats.append(htmlButtonCondo);
    this.htmlDivQuickStats.append(htmlButtonAllGroups);
    this.htmlDivQuickStats.append(htmlButtonUpdate);
    this.htmlDivQuickStats.append(htmlButtonUpdateDatePointer);
    this.htmlDivQuickStats.append(htmlButtonPivotStatData);
    this.htmlDivQuickStats.append(htmlButtonMonthlyReportData);
  }
};

marketStats.ui.addEventHandlers = function () {
  //- 参数变化事件句柄
  const msuiOnChange = marketStats.ui.events.onChange;
  msuiOnChange.ServerLocation.call(this);
  msuiOnChange.ReloadStats.call(this);
  msuiOnChange.AreaQuantityEveryUpdate.call(this);
  msuiOnChange.AreaCode.call(this);
  msuiOnChange.CurrentYearMonthDay.call(this);
  msuiOnChange.PropertyType.call(this);
  //- 点击操作命令句柄
  const msuiOnClick = marketStats.ui.events.onClick;
  msuiOnClick.AreaCodePointer.call(this);
  msuiOnClick.StatDatePointer.call(this);
  msuiOnClick.MonthlyUpdate.call(this);
  msuiOnClick.PivotStatData.call(this);
  msuiOnClick.MonthlyReportData.call(this);
  msuiOnClick.ReadStatDataButtons.call(this);
};

//- 增加events名字空间
marketStats.ui.events = { onChange: {}, onClick: {} };
marketStats.ui.events.onChange.ServerLocation = function () {
  // set up server url, remote or local
  let rads = document.getElementsByClassName("SaveRadios");
  for (var i = 0; i < rads.length; i++) {
    rads[i].addEventListener("change", (e) => {
      switch (e.target.value.trim()) {
        case "save local":
          this.mscore.updateServerURLs("local");
          console.log(`Set Server URL to Local : ${this.mscore.saveURL}`);
          break;
        case "save remote":
          this.mscore.updateServerURLs("remote");
          console.log(`Set Server URL to Remote : ${this.mscore.saveURL}`);
          break;
      }
    });
  }
};

marketStats.ui.events.onChange.ReloadStats = function () {
  // option for delete old data or not
  $("#pid_reload_stats").click((e) => {
    if ($(e.target).is(":checked")) {
      this.mscore.deleteOldData = true;
      console.log("OLD Data will be Deleted!");
    } else {
      this.mscore.deleteOldData = false;
      console.log("ONLY UPLOAD THE NEW DATA");
    }
  });
};

marketStats.ui.events.onChange.AreaQuantityEveryUpdate = function () {
  // option for how many areas in one stats update
  $("#pid_area_quantity_every_update").keypress((e) => {
    var keycode = e.keyCode ? e.keyCode : e.which;
    if (keycode == "13") {
      this.mscore.areaQuantityEveryUpdate = parseInt($(e.target).val());
      chrome.storage.local.set(
        {
          areaQuantityEveryUpdate: this.mscore.areaQuantityEveryUpdate,
        },
        () => {
          console.log("New this.areaQuantityEveryUpdate Save to Local Storage");
        }
      );
    }
  });
};

marketStats.ui.events.onChange.PropertyType = function () {
  let rads = document.getElementsByClassName("PropertyTypes");

  for (let i = 0; i < rads.length; i++) {
    rads[i].addEventListener("change", (e) => {
      let dwellingType = e.target.value.trim();
      console.log(e.target.value.trim());
      this.mscore.setReportDwellingType(dwellingType);
    });
  }
};

marketStats.ui.events.onChange.AreaCode = function () {
  // area code change
  if ($(`div.inputWrap input.acInput`).length > 0) {
    if (!this.htmlAcInput) {
      this.htmlAcInput = $(`div.inputWrap input.acInput`)[0];
      $(this.htmlAcInput).on("input change keydown keypress keyup mousedown click mouseup focusout", (e) => {
        console.log("area code changed: ", e.target.value);
      });
    } else {
      if ($("#pid_areaLabel")) {
        if ($("#pid_areaLabel").text() != this.htmlAcInput.value) {
          $("#pid_areaLabel").text(this.htmlAcInput.value);
          this.mscore.copyTextToClipboard(this.htmlAcInput.value);
          console.log(this.htmlAcInput.value);
        }
      }
    }
  }
};

marketStats.ui.events.onChange.CurrentYearMonthDay = function () {
  $("#pid_data_month_of_updating").on("change click", (e) => {
    console.log("current year month day changed!", e.target.value);
    this.currentYearMonthDay = this.util.getYearMonthDay(1, e.target.value);
    this.previousYearMonthDay = this.util.getYearMonthDay(2, e.target.value);
    this.startYearMonthDay = this.util.getYearMonthDay(3, e.target.value);
    console.log(this.currentYearMonthDay, " | ", this.previousYearMonthDay, " | ", this.startYearMonthDay);
  });
};

marketStats.ui.events.onClick.StatDatePointer = function () {
  // set event for UPDATE STAT DATE POINTERS
  $("#pid_update_stat_date_point").on("click", () => {
    console.log("update date pointers clicked");
    this.mscore
      .updateStatDatePointers(this.currentYearMonthDay, this.previousYearMonthDay, this.startYearMonthDay)
      .then((res) => console.log(`Updated Data Pointers Done: ${res}`))
      .catch((err) => console.error(`Updated Date Pointer Error: ${err}`));
  });
};

marketStats.ui.events.onClick.AreaCodePointer = function () {
  // Reset Area Code Pointer, for monthly update start over
  $("#pid_reset_area_pointer").on("click", () => {
    this.mscore.iAreaCodePointer = parseInt($("#pid_reset_area_point_number").val());
    chrome.storage.local.set(
      {
        iAreaCodePointer: this.mscore.iAreaCodePointer,
      },
      () => {
        // move area pointer to 0 /beginning of the list
        // start over
        let htmlButtonUpdate = $("#pid_update_stat");
        htmlButtonUpdate.val(`Monthly Update (${this.mscore.iAreaCodePointer} | ${AreaCodes.length})`);
      }
    );
  });
};

marketStats.ui.events.onClick.MonthlyUpdate = function () {
  // set event for 'Monthly Update(#|#)' Button
  $("#pid_update_stat").on("click", () => {
    let dataPeriod = this.util.getStatDataPeriod();
    this.mscore.updateMonthlyStats(dataPeriod);
  });
};

marketStats.ui.events.onClick.ReadStatDataButtons = function () {
  // add functions for the command buttons
  // set event for 'Read All 4 Groups' Button
  $("#pid_read_stat_All_Groups").on("click", () => {
    let areaCode = this.util.getAreaCode();
    let dataPeriod = this.util.getStatDataPeriod();
    this.mscore.updateSpecAreaStats(dataPeriod, areaCode);
  });
  // set event for 'Read All Property Type Group' Button
  $("#pid_read_stat_All").on("click", () => {
    let areaCode = this.util.getAreaCode();
    let dataPeriod = this.util.getStatDataPeriod();
    let groupCode = GetGroupCode("All");

    this.mscore.updateSpecGroupStats(dataPeriod, areaCode, groupCode);
  });
  // set event for 'Read Detached' Button
  $("#pid_read_stat_Detached").on("click", () => {
    let areaCode = this.util.getAreaCode();
    let dataPeriod = this.util.getStatDataPeriod();
    let groupCode = GetGroupCode("Detached"); //"#0=pt:2|";
    this.mscore.updateSpecGroupStats(dataPeriod, areaCode, groupCode);
  });
  // set event for 'Read Townhouse' Button
  $("#pid_read_stat_Townhouse").on("click", () => {
    let areaCode = this.util.getAreaCode();
    let dataPeriod = this.util.getStatDataPeriod();
    let groupCode = GetGroupCode("Townhouse");
    this.mscore.updateSpecGroupStats(dataPeriod, areaCode, groupCode);
  });
  // set event for 'Read Condo' Button
  $("#pid_read_stat_Condo").on("click", () => {
    let areaCode = this.util.getAreaCode();
    let dataPeriod = this.util.getStatDataPeriod();
    let groupCode = GetGroupCode("Apartment"); //"#0=pt:4|";
    this.mscore.updateSpecGroupStats(dataPeriod, areaCode, groupCode);
  });
};

marketStats.ui.events.onClick.PivotStatData = function () {
  // set event and add function for the Pivot Stat Data button
  $("#pid_pivot_stat_data").on("click", () => {
    console.log(
      `Pivot Market Data of ${this.currentYearMonthDay} | ${this.previousYearMonthDay} | ${this.startYearMonthDay}`
    );
    this.mscore
      .updateREMarketPivot(this.currentYearMonthDay, this.previousYearMonthDay, this.startYearMonthDay)
      .then((res) => console.log(res));
  });
};

marketStats.ui.events.onClick.MonthlyReportData = function () {
  // set event and add function for the Monthly Report Data button
  // INSERT MONLTY REPORT DATA INTO TABLE WP_PID_MARKET_MONTHLY_REPORT
  $("#pid_monthly_report_data").on("click", () => {
    console.log(`Monthly Report Data of ${this.currentYearMonthDay}`);
    this.mscore
      .updateREMarketMonthlyReportData(this.currentYearMonthDay, this.previousYearMonthDay, this.startYearMonthDay)
      .then((res) => console.log(res));
  });
};

marketStats.util.getAreaCode = function () {
  // Read Area Code from the Selection Box on StatsCenter Web Page
  if (!this.htmlAcInput) {
    this.htmlAcInput = $(`div.inputWrap input.acInput`)[0];
  }
  let areaCode = this.htmlAcInput.value;
  let cityName = "";
  let areaCodeLastPosition = areaCode.indexOf("-");
  if (areaCodeLastPosition > 0) {
    cityName = areaCode.substr(areaCodeLastPosition + 1, areaCode.length - areaCodeLastPosition).trim();
    areaCode = areaCode.substr(0, areaCodeLastPosition - 1).trim();
  }
  // Correct some areaCode
  // Burnaby & Vancouver City code VBU , VVA
  if (areaCode == "V") {
    areaCode = "V" + cityName.substr(0, 2);
    areaCode = areaCode.toUpperCase();
  }
  // Abbotsford City Code F70 -> F70A ( F70 for Polar Langley)
  if (areaCode == "F70" && cityName == "Abbotsford") {
    areaCode = "F70A";
  }
  // Langley City Code F60 -> F60A ( F60 for MurrayVille Langley)
  // 1: update wp_pid_cities
  // 2: update wp_pid_stats_code
  // 3: update wp_pid_neighborhoods
  if (areaCode == "F60" && cityName == "Langley") {
    areaCode = "F60A";
  }
  // Mission F80 -> F80A
  if (areaCode == "F80" && cityName == "Mission") {
    areaCode = "F80A";
  }
  // repair White Rock, F54 -> F54A
  if (areaCode == "F54" && cityName == "White Rock") {
    areaCode = "F54A";
  }
  console.log(areaCode);
  return areaCode;
};

marketStats.util.getYearMonthDay = function (datePointerNo, dateYearMonthDay = "") {
  // get the date string by datePointerNo and the selected YearMonthDay
  let today = new Date();
  // baseDay is 需要做数据统计的月份的第一天
  let baseDay = dateYearMonthDay
    ? new Date(dateYearMonthDay.replace(/-/g, "/")) // Do not use -, because js will have one day off
    : new Date(today.getFullYear(), today.getMonth() - 1, "01");
  let ret_year_month_day = null;
  // SET LAST MONTH AS CURRENT REBGV STAT CENTER MONTH
  switch (datePointerNo) {
    case 1: // current year month day
      let current_year_month_day = new Date(baseDay.getFullYear(), baseDay.getMonth(), "01");
      ret_year_month_day = current_year_month_day.toISOString().split("T")[0];
      break;
    case 2: // previous year month day
      let previous_year_month_day = new Date(baseDay.getFullYear(), baseDay.getMonth() - 1, "01");
      ret_year_month_day = previous_year_month_day.toISOString().split("T")[0];
      break;
    case 3: // start year month day
      let start_year_month_day = new Date(baseDay.getFullYear(), baseDay.getMonth() - 12, "01");
      ret_year_month_day = start_year_month_day.toISOString().split("T")[0];
      break;
    case 4: // second last year month day
      let second_last_year_month_day = new Date(baseDay.getFullYear(), baseDay.getMonth() - 2, "01");
      ret_year_month_day = second_last_year_month_day.toISOString().split("T")[0];
      break;
  }

  return ret_year_month_day;
};

marketStats.util.getYearMonthDay_new = function (backwardMonthNumber) {
  // get the date string by datePointerNo and the selected YearMonthDay
  let today = new Date();
  // baseDay is 需要做数据统计的月份的第一天
  let baseDay = new Date(today.getFullYear(), today.getMonth() - 1, "01");
  let ret_year_month_day = null;
  // SET LAST MONTH AS CURRENT REBGV STAT CENTER MONTH
  ret_year_month_day = new Date(baseDay.getFullYear(), baseDay.getMonth() - backwardMonthNumber, "01");
  ret_year_month_day = ret_year_month_day.toISOString().split("T")[0];

  return ret_year_month_day;
};

marketStats.util.getStatDataPeriod = function () {
  // get the data period setting from the drop-down list
  let ret = $("#pid_data_periods").val();
  console.log("Starting Monthly STAT DATA UPDATE... ...");
  this.dataPeriod = ret ? StatsPeriod.max_update : ret;
  return ret;
};

marketStats.util.serialize = function (obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
};

marketStats.util.sleep = function (miliseconds) {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
};
