chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action && request.action === "Search Stat Code") {
    searchStatCode(request)
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse(err));
  }

  if (request.action && request.action === "Save Stat Data") {
    saveStatData(request).then((res) => sendResponse(res));
  }

  if (request.action && request.action === "Save Stat Data Of All Metrics") {
    saveStatDataOfAllMetrics(request)
      .then((res) => sendResponse(res))
      .catch((e) => {
        console.log(e);
        sendResponse("SaveDataError");
      });
  }

  if (request.action && request.action === "Update Stat Code") {
    updateStatCode(request).then((res) => sendResponse(res));
  }
  if (request.action && request.action === "Update Stat Date Pointers") {
    updateStatDatePointers(request).then((res) => sendResponse(res));
  }
  if (request.action && request.action === "Update RE Market Pivot Table") {
    updateREMarketPivot(request).then((res) => sendResponse(res));
  }
  if (request.action && request.action === "Update RE Market MONTHLY REPORT Table") {
    updateREMarketMonthlyReportData(request).then((res) => sendResponse(res));
  }

  return true;
});

async function searchStatCode(postData) {
  //areaCode -> statCode, example: VPMCP -> 5243
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  };
  // const url =
  //   "http://localhost/pidrealty4/wp-content/themes/realhomes-child-3/db/data.php";
  const url = postData.url;
  try {
    const res = await fetch(url, options);
    const statCode = await res.json();
    return Promise.resolve(statCode);
  } catch (err) {
    let error = { stat_code: null, errorMessage: err.message };
    return Promise.reject(error);
  }
}

async function updateStatCode(postData) {
  //areaCode, groupCode -> statCode Availability, example: All -> 0
  const options = {
    method: "POST",
    header: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  };
  // const url =
  //   "http://localhost/pidrealty4/wp-content/themes/realhomes-child-3/db/updateStatCode.php";
  const url = postData.url;
  const res = await fetch(url, options);
  const updateResult = await res.json();
  return Promise.resolve(updateResult);
}

async function updateStatDatePointers(postData) {
  // datePointer 1, 2, 3
  const options = {
    method: "POST",
    header: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  };
  const url = postData.url;
  const res = await fetch(url, options);
  const updateResult = await res.json();
  return Promise.resolve(updateResult);
}

async function updateREMarketPivot(postData) {
  // datePointer 1 is the current stat month
  const options = {
    method: "POST",
    header: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  };
  const url = postData.url;
  const res = await fetch(url, options);
  const updateResult = await res.json();
  return Promise.resolve(updateResult);
}

async function updateREMarketMonthlyReportData(postData) {
  // datePointer 1 is the current stat month
  const options = {
    method: "POST",
    header: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  };
  const url = postData.url;
  const res = await fetch(url, options);
  const updateResult = await res.json();
  return Promise.resolve(updateResult);
}

async function saveStatData(postData) {
  // place the stat data from StatsCentre to MySQL Database Table
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  };
  const url = postData.saveURL;
  let res = await fetch(url, options); // PHP should return json object, by json_decode()
  const saveDataResult = await res.json();
  console.log(`${postData.areaCode}:${postData.propertyType}:${saveDataResult}`);
  return Promise.resolve(saveDataResult);
}

async function saveStatDataOfAllMetrics(postData) {
  // place the stat data from StatsCentre to MySQL Database Table
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  };
  const url = postData.saveURLOfAllMetrics;
  let res = await fetch(url, options); // PHP should return json object, by json_decode()
  const saveDataResult = await res.json();
  console.log(`${saveDataResult}`);
  return Promise.resolve(saveDataResult);
}
