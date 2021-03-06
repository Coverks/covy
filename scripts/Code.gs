var FORMAT_PRETTY    = 'Pretty';
var LANGUAGE_JS      = 'JavaScript';
var STRUCTURE_LIST   = 'List';

var DEFAULT_FORMAT    = FORMAT_PRETTY;
var DEFAULT_LANGUAGE  = LANGUAGE_JS;
var DEFAULT_STRUCTURE = STRUCTURE_LIST;

function customOnEdit(e){
  
  var range    = e.range;
  var row      = range.getRow();
  
  if ( 1 == row ) {
    return; 
  }
  
  var oldValue = e.oldValue;
  
  var today = new Date();
  var date  = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time  = today.getHours() + ":" + ( today.getMinutes() < 10 ? '0' : '' ) + today.getMinutes() + ":" + today.getSeconds();
  var date  = date + ' ' + time;
  
  var noteText = 'Last Modified: ' + "\n" + date;
  
  if ( null != oldValue ) {
    noteText += "\n\n" + 'Previous Data: ' + "\n" + oldValue;
  }
  
  var previousNote = range.getNote();
  
  if ( null != previousNote && null != oldValue ) {
    range.setNote(noteText);
  }
    
  syncDialog(range);
}

function syncDialog(range) {
  
  var cellRow = range.getRow();
  
  if ( 1 == cellRow ) {
    return;
  }
  
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Would you like to sync data?', ui.ButtonSet.YES_NO);

  if (response == ui.Button.YES) {
    exportSheet(cellRow);
  }
}

function onOpen() {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var menuEntries = [
    {name: "Sync Active Sheet", functionName: "exportSheet"},
    {name: "Clear Notes", functionName: "clearNotes"},
  ];
    
  ss.addMenu("Sync", menuEntries);
}

function clearNotes() {
    
  var ss       = SpreadsheetApp.getActiveSpreadsheet();
  var sheet    = ss.getActiveSheet();

  var maxRows    = sheet.getMaxRows();
  var maxColumns = sheet.getMaxColumns();
  var range  = sheet.getRange(1, 1, maxRows, maxColumns);
    
  range.clearNote();
}
    
function exportSheet(cellRow) {
    
  Logger.log( cellRow );
    
  options = {};
  options.language  = DEFAULT_LANGUAGE;
  options.format    = DEFAULT_FORMAT;
  options.structure = DEFAULT_STRUCTURE;
    
  var ss       = SpreadsheetApp.getActiveSpreadsheet();
  var sheet    = ss.getActiveSheet();
  var rowsData = getRowsData_(sheet, options, cellRow);
    
  if ( undefined == cellRow ) {  
    rowsData.forEach(function( row, index ) {
      var json = makeJSON_(row, options);
      syncMasterSheet( json );
    });  
  } else {
    rowsData = rowsData[0];
    var json = makeJSON_(rowsData, options);
    syncMasterSheet( json );
  }
    
  return;
}
    
function syncMasterSheet(excelData) {
  
  var urlAPI = 'http://coverks-covy.eu.ngrok.io/products/update';

  var options = {
    method: 'put',
    contentType: 'application/json',
    payload: excelData
  };

  UrlFetchApp.fetch( urlAPI, options );
}

function makeJSON_(object, options) {
  var jsonString = JSON.stringify(object, null, 4);
  return jsonString;
}

// getRowsData iterates row by row in the input range and returns an array of objects.
// Each object contains all the data for a given row, indexed by its normalized column name.
// Arguments:
//   - sheet: the sheet object that contains the data to be processed
//   - range: the exact range of cells where the data is stored
//   - columnHeadersRowIndex: specifies the row number where the column names are stored.
//       This argument is optional and it defaults to the row immediately above range; 
// Returns an Array of objects.
function getRowsData_(sheet, options, cellRow) {
    
  var startRow   = sheet.getFrozenRows()+1;
  var maxRows    = sheet.getMaxRows();
  var maxColumns = sheet.getMaxColumns();

  if ( undefined !== cellRow ) {
    startRow = cellRow;
    maxRows = 1;
  }
    
  var headersRange = sheet.getRange(1, 1, sheet.getFrozenRows(), sheet.getMaxColumns());
  var headers      = headersRange.getValues()[0];
  var dataRange    = sheet.getRange(startRow, 1, maxRows, maxColumns);
  var objects      = getObjects_(dataRange.getValues(), normalizeHeaders_(headers));
  
  return objects;
}

// getColumnsData iterates column by column in the input range and returns an array of objects.
// Each object contains all the data for a given column, indexed by its normalized row name.
// Arguments:
//   - sheet: the sheet object that contains the data to be processed
//   - range: the exact range of cells where the data is stored
//   - rowHeadersColumnIndex: specifies the column number where the row names are stored.
//       This argument is optional and it defaults to the column immediately left of the range; 
// Returns an Array of objects.
function getColumnsData_(sheet, range, rowHeadersColumnIndex) {
  
  rowHeadersColumnIndex = rowHeadersColumnIndex || range.getColumnIndex() - 1;
  
  var headersTmp = sheet.getRange(range.getRow(), rowHeadersColumnIndex, range.getNumRows(), 1).getValues();
  var headers    = normalizeHeaders_(arrayTranspose_(headersTmp)[0]);
  
  return getObjects(arrayTranspose_(range.getValues()), headers);
}


// For every row of data in data, generates an object that contains the data. Names of
// object fields are defined in keys.
// Arguments:
//   - data: JavaScript 2d array
//   - keys: Array of Strings that define the property names for the objects to create
function getObjects_(data, keys) {
  
  var objects = [];
  
  for (var i = 0; i < data.length; ++i) {
  
    var object  = {};
    var hasData = false;
    
    for (var j = 0; j < data[i].length; ++j) {
    
      var cellData = data[i][j];
      
      if (isCellEmpty_(cellData)) {
        continue;
      }
      
      object[keys[j]] = cellData;
      
      hasData = true;
    }
    
    if (hasData) {
      objects.push(object);
    }
  }
  
  return objects;
}

// Returns an Array of normalized Strings.
// Arguments:
//   - headers: Array of Strings to normalize
function normalizeHeaders_(headers) {
  
  var keys = [];
  
  for (var i = 0; i < headers.length; ++i) {
    
    var key = normalizeHeader_(headers[i]);
    
    if (key.length > 0) {
      keys.push(key);
    }
  }
  
  return keys;
}

// Normalizes a string, by removing all alphanumeric characters and using mixed case
// to separate words. The output will always start with a lower case letter.
// This function is designed to produce JavaScript object property names.
// Arguments:
//   - header: string to normalize
// Examples:
//   "First Name" -> "firstName"
//   "Market Cap (millions) -> "marketCapMillions
//   "1 number at the beginning is ignored" -> "numberAtTheBeginningIsIgnored"
function normalizeHeader_(header) {
  
  var key       = "";
  var upperCase = false;
  
  for (var i = 0; i < header.length; ++i) {
    
    var letter = header[i];
    
    if (letter == " " && key.length > 0) {
      upperCase = true;
      continue;
    }
    
    if (!isAlnum_(letter) && '_' != letter) {
      continue;
    }
    
    if (key.length == 0 && isDigit_(letter)) {
      continue; // first character must be a letter
    }
    
    if (upperCase) {
      upperCase = false;
      key += letter.toUpperCase();
    } else {
      key += letter.toLowerCase();
    }
  }
  
  return key;
}

// Returns true if the cell where cellData was read from is empty.
// Arguments:
//   - cellData: string
function isCellEmpty_(cellData) {
  return typeof(cellData) == "string" && cellData == "";
}

// Returns true if the character char is alphabetical, false otherwise.
function isAlnum_(char) {
  return char >= 'A' && char <= 'Z' ||
    char >= 'a' && char <= 'z' ||
    isDigit_(char);
}

// Returns true if the character char is a digit, false otherwise.
function isDigit_(char) {
  return char >= '0' && char <= '9';
}

// Given a JavaScript 2d Array, this function returns the transposed table.
// Arguments:
//   - data: JavaScript 2d Array
// Returns a JavaScript 2d Array
// Example: arrayTranspose([[1,2,3],[4,5,6]]) returns [[1,4],[2,5],[3,6]].
function arrayTranspose_(data) {
  
  if (data.length == 0 || data[0].length == 0) {
    return null;
  }

  var ret = [];
  for (var i = 0; i < data[0].length; ++i) {
    ret.push([]);
  }

  for (var i = 0; i < data.length; ++i) {
    for (var j = 0; j < data[i].length; ++j) {
      ret[j][i] = data[i][j];
    }
  }

  return ret;
}
