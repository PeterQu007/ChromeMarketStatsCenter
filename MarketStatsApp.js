/**
 * class MarketStats
 * fetch real estate market stats from Stats Center
 * save the stats to MySql table: wp_pid_market
 * by PHP API: saveStatData.php
 */

$(document).ready(function () {
  try {
    const ms = new marketStats.ui();
    console.log(ms.htmlDiv);
    
    console.warn("Market Stats Extension Loaded Successfully!");
    console.warn("Make sure the local APACHE / MySQL Server is Running!");
  } catch (err) {
    console.error(`Loading Market Stats Extension Failed:${err.message}`);
    console.error(err);
  }
});
