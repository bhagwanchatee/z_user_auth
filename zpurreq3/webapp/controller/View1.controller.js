sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/export/Spreadsheet"
], function(Controller, JSONModel,Spreadsheet) {
  "use strict";

  return Controller.extend("zpurreq3.controller.View1", {
    onInit: function() {
      this.oTable = this.byId("purchaseTable");
      var oJSONModel = new JSONModel({ Results: [] });
      this.getView().setModel(oJSONModel,"localJson");
        this.oJSONModel=this.getView().getModel("localJson");


      this._iPage = 0;
      this._iPageSize = 2000;
      this._oODataModel = this.getOwnerComponent().getModel(); // OData V2 model from manifest
    },
    onSearchold: function(oEvent) {
            var oSmartFilterBar = this.byId("smartFilterBar");
            var oParams = oSmartFilterBar.getParameters(); // not enough by itself

            // Get filter data
            //var oFilterData = oSmartFilterBar.getFilterData(true); // true = include empty values
            //   var aFilters = [];

            //   // Example: build filters manually
            //   if (oFilterData.ID) {
            //     aFilters.push(new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.EQ, oFilterData.ID));
            //   }
            //   if (oFilterData.miro_doc) {
            //     aFilters.push(new sap.ui.model.Filter("miro_doc", sap.ui.model.FilterOperator.Contains, oFilterData.miro_doc));
            //   }
            var aFilters = oSmartFilterBar.getFilters();
            // Reset pagination
            this._iPage = 0;
            this.oJSONModel.setData({ Results: [] });

            // Load with filters
            this._loadData(aFilters);
            },

    onSearch1: function(oEvent) {
      // Reset pagination
      this._iPage = 0;
      this.oJSONModel.setData({ Results: [] });
      this._loadData();
    },

    _loadDataold: function(aFilters) {
      let that = this;

      this._oODataModel.read("/ZMM_PURCHASE_REGISTER_FINAL", {
        filters: aFilters || [],
        urlParameters: {
          "$skip": this._iPage * this._iPageSize,
          "$top": this._iPageSize
        },
        success: function(oData) {
            
          var aNew = oData.results || []; 
          var aExisting = that.oJSONModel.getProperty("/Results") || []; // Merge 
          var aCombined = aExisting.concat(aNew); // Deduplicate across ALL fields 
          var seen = new Set(); 
          var aUnique = []; 
          
          aCombined.forEach(function(item) { 
            var key = item.ID;
          
            if (!seen.has(key)) {
                 seen.add(key); 
                 aUnique.push(item); 
            }

            // var key = JSON.stringify(item); // stringify entire object 
            // if (!seen.has(key)) { 
            //     seen.add(key); aUnique.push(item); 
            // } 
        }); 


            that.oJSONModel.setProperty("/Results", aUnique); 
            that._iPage++;
        },
        error: function(oError) {
          sap.m.MessageToast.show("Error loading data");
        }
      });
    },

    onRowsUpdatedold: function(oEvent) {
      let iFirstRow = this.oTable.getFirstVisibleRow();
      let iVisibleCount = this.oTable.getVisibleRowCount();
      let iTotal = this.oJSONModel.getProperty("/Results").length;

      if (iFirstRow + iVisibleCount >= iTotal - 5) {
        this._loadData();
      }
    },
    onSearch: function(oEvent) {
  var oSmartFilterBar = this.byId("smartFilterBar");
  var aFilters = oSmartFilterBar.getFilters();

  // Reset pagination
  this._iPage = 0;

  if (aFilters && aFilters.length > 0) {
    // Filters applied → load all data (no skip/top)
    this._loadData(aFilters, true); // true = replace mode
  } else {
    // No filters → scroll mode with skip/top
    this.oJSONModel.setData({ Results: [] });
    this._loadData([], false); // false = merge mode
  }
},

_loadData: function(aFilters, bReplace) {
  var that = this;

  var oParams = {};
  if (!aFilters || aFilters.length === 0) {
    // Only use skip/top when no filters
    oParams["$skip"] = this._iPage * this._iPageSize;
    oParams["$top"] = this._iPageSize;
  }

  this._oODataModel.read("/ZMM_PURCHASE_REGISTER_FINAL", {
    filters: aFilters || [],
    urlParameters: oParams,
    success: function(oData) {
      var aNew = oData.results || [];
      var aExisting = bReplace ? [] : (that.oJSONModel.getProperty("/Results") || []);
      var aCombined = aExisting.concat(aNew);

      // Deduplicate always
      var seen = new Set();
      var aUnique = [];
      aCombined.forEach(function(item) {
        // var cleanItem = Object.assign({}, item);
        // delete cleanItem.__metadata;
        var key = item.ID; // or item.ID for single field
        if (!seen.has(key)) {
          seen.add(key);
          aUnique.push(item);
        }
      });

      that.oJSONModel.setProperty("/Results", aUnique);

      if (!aFilters || aFilters.length === 0) {
        that._iPage++; // only increment page in scroll mode
      }
    },
    error: function() {
      sap.m.MessageToast.show("Error loading data");
    }
  });
},

onRowsUpdated: function(oEvent) {
  var oSmartFilterBar = this.byId("smartFilterBar");
  var aFilters = oSmartFilterBar.getFilters();

  // Only scroll‑load if no filters are active
  if (!aFilters || aFilters.length === 0) {
    var iFirstRow = this.oTable.getFirstVisibleRow();
    var iVisibleCount = this.oTable.getVisibleRowCount();
    var iTotal = this.oJSONModel.getProperty("/Results").length;

    if (iFirstRow + iVisibleCount >= iTotal - 5) {
      this._loadData([], false);
    }
  }
},
onExport: function() {
  var oTable = this.byId("purchaseTable");
  var aCols = [];

  // Collect visible columns
  oTable.getColumns().forEach(function(oCol) {
    if (oCol.getVisible()) {
      aCols.push({
        label: oCol.getLabel().getText(),
        property: oCol.getTemplate().getBindingInfo("text").parts[0].path
      });
    }
  });

  // Get table data
  var aData = this.oJSONModel.getProperty("/Results");

  // Configure spreadsheet
  var oSettings = {
    workbook: { columns: aCols },
    dataSource: aData,
    fileName: "PurchaseRegister.xlsx"
  };

  var oSpreadsheet = new Spreadsheet(oSettings);
  oSpreadsheet.build().finally(function() {
    oSpreadsheet.destroy();
  });
}


  });
});



// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/model/json/JSONModel"
// ], function(Controller, JSONModel) {
//     "use strict";

//     return Controller.extend("zpurreq3.controller.View1", {
//         onInit: function () {
//             // Initial empty model
//             // this._aAllData = [];   // store all loaded data
//             // this._batchSize = 20;  // rows per batch
//             // this._lastLoaded = 0;  // track how many rows loaded

//             // var oModel = new JSONModel({ Products: [] });
//             // this.getView().setModel(oModel);

//             // // Access SmartTable inner GridTable
//             // var oSmartTable = this.byId("smartTable");
//             // var oTable = oSmartTable.getTable();

//             // // Bind rows to JSON path
//             // oTable.bindRows("/ZMM_PURCHASE_REGISTER_FINAL");

//             // // Attach scroll event
//             // oTable.attachFirstVisibleRowChanged(this.onScrollLoad.bind(this));

//             // // Initial batch load
//             // this._loadBatch();
//         },
        
//         onSearch: function () {
//       const oTable = this.byId("uiTable");
//       const oBinding = oTable.getBinding("rows");

//       // Reset paging
//       this._loadedRows = this._pageSize;

//       // IMPORTANT: clear cache to avoid duplicates
//       oBinding.refresh(true);

//       // Trigger first load
//       oBinding.getContexts(0, this._loadedRows);
//     },
//         // Simulate backend batch fetch
//         _fetchBatchData: function(skip, top) {
//             // In real app: call OData service with $skip/$top
//             // Here: simulate with dummy data
//             var aBatch = [];
//             for (var i = skip; i < skip + top; i++) {
//                 aBatch.push({
//                     ProductID: "P" + i,
//                     Name: "Item " + i,
//                     Category: "Category " + (i % 5),
//                     Price: (i * 10)
//                 });
//             }
//             return aBatch;
//         },

//         // Deduplicate by all fields
//         _removeDuplicates: function(aData) {
//             var seen = new Set();
//             return aData.filter(function(item) {
//                 var key = Object.values(item).join("|");
//                 if (seen.has(key)) {
//                     return false;
//                 }
//                 seen.add(key);
//                 return true;
//             });
//         },

//         // Load next batch
//         _loadBatch: function() {
//             var aBatch = this._fetchBatchData(this._lastLoaded, this._batchSize);
//             this._lastLoaded += this._batchSize;

//             // Merge with existing data
//             this._aAllData = this._aAllData.concat(aBatch);

//             // Deduplicate
//             var aUnique = this._removeDuplicates(this._aAllData);

//             // Update model
//             this.getView().getModel().setProperty("/Products", aUnique);
//         },

//         // Scroll event handler
//         onScrollLoad: function(oEvent) {
//             var iFirstRow = oEvent.getParameter("firstVisibleRow");
//             var oTable = oEvent.getSource();
//             var iVisibleRows = oTable.getVisibleRowCount();

//             // If user scrolls near bottom, load next batch
//             if (iFirstRow + iVisibleRows >= this._aAllData.length) {
//                 this._loadBatch();
//             }
//         }
//     });
// });
