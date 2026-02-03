sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    'sap/m/BusyDialog'
], (Controller, JSONModel, Fragment, FilterOperator, Filter, MessageBox, MessageToast, expLibrary, Spreadsheet, BusyDialog) => {
    "use strict";
    var that, oView;
    var EdmType = expLibrary.EdmType;
    return Controller.extend("zcustedi.controller.Main", {
        onInit() {
            that = this;
            oView = that.getView();
            this.oParameters = {
                "$top": 10000
            };
            that.i18n = that.getOwnerComponent().getModel("i18n").getResourceBundle();
            oView.setModel(new JSONModel(), "customerModel");
            oView.setModel(new JSONModel(), "billingDocModel");
            //models for forms
            oView.setModel(new JSONModel(), "bajajModel");
            oView.setModel(new JSONModel(), "mahDocModel");
            oView.setModel(new JSONModel(), "endModel");
            oView.setModel(new JSONModel(), "pvplModel");
            var oVisibilityObj = {
                "bajajVisible": false,
                "mahVisible": false,
                "endVisible": false,
                "pvplVisible": false
            };
            oView.setModel(new JSONModel(oVisibilityObj), "visModel"); //visibility controlling of forms
            that.oDataModel = that.getOwnerComponent().getModel();
            that.loadCustomerData();
        },
        loadCustomerData: function () {
            var oBusyDialog = new BusyDialog();
            oBusyDialog.open();
            that.oDataModel.read("/customerVh", {
                urlParameters: that.oParameters,
                success: function (oData) {
                    oBusyDialog.close();
                    oView.getModel("customerModel").setSizeLimit(100000);
                    oView.getModel("customerModel").setData(oData.results);
                    oView.getModel("customerModel").refresh();
                },
                error: function (oError) {
                    MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                    oBusyDialog.close();
                }
            });
        },
        openCustomerF4: function (oEvt) {
            if (!that._custF4Help) {
                that._custF4Help = Fragment.load({
                    name: "zcustedi.fragments.customer",
                    controller: that
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.addStyleClass("sapUiSizeCompact");
                    oDialog.setModel(oView.getModel("customerModel"));
                    return oDialog;
                });
            }
            that._custF4Help.then(function (oDialog) {
                oDialog.open();
            });
        },
        loadAllData: function (that) {
           
            const PAGE_SIZE = 2000; // backend limitation
            var aFilters = [];
                            var oFilter = new sap.ui.model.Filter("SoldToParty", FilterOperator.EQ, oView.byId("custInput").getValue());
                            aFilters.push(oFilter);

            return new Promise((resolve, reject) => {

                // Step 1: Get count
                that.oDataModel.read("/billingDocVh/$count", {
                      filters: [aFilters],
                    //urlParameters: { "$count": true },
                    success: (data, response) => {
                        const totalCount = Number(response.data);

                        let results = [];
                        let skip = 0;
                        
                        // Step 2: Load data in batches
                        const loadBatch = () => {
                        
                            that.oDataModel.read("/billingDocVh", {
                                 filters: [aFilters],
                                urlParameters: {
                                    "$skip": skip,
                                    "$top": PAGE_SIZE
                                },
                                success: (res) => {
                                    results.push(...res.results);
                                    skip += PAGE_SIZE;

                                    if (skip < totalCount) {
                                        loadBatch(); // next batch
                                    } else {
                                        resolve(results); // all done
                                    }
                                },
                                error:(err) => {
                                      reject
                                    
                                    }
                                });
                        };

                        loadBatch();
                    },
                    error: reject
                });
            });
        },
        openBillingDocF4: function (oEvt) {
            var oBusyDialog = new BusyDialog();
            if (oView.getModel("billingDocModel").getData().length > 0) {
                that.openBillingDoc();
            } else {
               
               that.loadAllData(that).then((data) => {
                console.log("Final count:", data.length);
                oBusyDialog.close();
                        oView.getModel("billingDocModel").setSizeLimit(100000);
                        oView.getModel("billingDocModel").setData(data);
                        oView.getModel("billingDocModel").refresh();
                        that.openBillingDoc();

            });
               
                // var aFilters = [];
                // var oFilter = new sap.ui.model.Filter("SoldToParty", FilterOperator.EQ, oView.byId("custInput").getValue());
                // aFilters.push(oFilter);
                // oBusyDialog.open();
                // that.oDataModel.read("/billingDocVh", {
                //     urlParameters: that.oParameters,
                //     filters: aFilters,
                //     success: function (oData) {
                //         oBusyDialog.close();
                //         oView.getModel("billingDocModel").setSizeLimit(100000);
                //         oView.getModel("billingDocModel").setData(oData.results);
                //         oView.getModel("billingDocModel").refresh();
                //         that.openBillingDoc();
                //     },
                //     error: function (oError) {
                //         MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                //         oBusyDialog.close();
                //     }
                // });
            }
        },
        openBillingDoc: function () {
            if (!that._billingF4Help) {
                that._billingF4Help = Fragment.load({
                    name: "zcustedi.fragments.billingDoc",
                    controller: that
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.addStyleClass("sapUiSizeCompact");
                    oDialog.setModel(oView.getModel("billingDocModel"));
                    return oDialog;
                });
            }
            that._billingF4Help.then(function (oDialog) {
                oDialog.open();
            });
        },
        handleCloseCust: function (oEvt) {
            oView.byId("custInput").setValue(oEvt.getParameter("selectedItem").getTitle());
            oView.byId("custName").setValue(oEvt.getParameter("selectedItem").getDescription());
            oView.getModel("billingDocModel").setData([]);
            oView.byId("billingInput").setEditable(true);
            oView.byId("billingInput").setValue("");
            oView.getModel("visModel").setProperty("/bajajVisible", false);
            oView.getModel("visModel").setProperty("/mahVisible", false);
            oView.getModel("visModel").setProperty("/endVisible", false);
            oView.getModel("visModel").setProperty("/pvplVisible", false);
            oEvt.getSource().getBinding("items").filter([]);
        },
        handleCloseBillDoc: function (oEvt) {
            oView.byId("billingInput").setValue(oEvt.getParameter("selectedItem").getTitle());
            oEvt.getSource().getBinding("items").filter([]);
        },
        handleCustSearch: function (oEvt) {
            debugger;
            var oSearchState = [
                new Filter("Customer", FilterOperator.Contains, oEvt.getParameter("value")),
                new Filter("CustomerName", FilterOperator.Contains, oEvt.getParameter("value"))
            ];
            oEvt.getSource().getBinding("items").filter(new Filter({
                filters: oSearchState,
                and: false,
            }), "Application");
        },
        handleBillingSearch: function (oEvt) {
            debugger;
            var oSearchState = new Filter("BillingDocument", FilterOperator.Contains, oEvt.getParameter("value"));
            oEvt.getSource().getBinding("items").filter([oSearchState], "Application");
        },
        loadFormData: function () {
            if (oView.byId("custInput").getValue() == "" || oView.byId("billingInput").getValue() == "") {
                MessageToast.show(that.i18n.getText("goMsg"));
                return;
            }
            if (oView.byId("custName").getValue().toLowerCase().includes("bajaj")) {
                that.loadBillingData("B");
                oView.getModel("visModel").setProperty("/bajajVisible", true);
                oView.getModel("visModel").setProperty("/mahVisible", false);
                oView.getModel("visModel").setProperty("/endVisible", false);
                oView.getModel("visModel").setProperty("/pvplVisible", false);
                oView.byId("bajajTitle").setText(oView.byId("custName").getValue());
                oView.byId("bajajFormH").setModel("bajajModel");
                oView.byId("bajajFormI").setModel("bajajModel");

            } else if (oView.byId("custName").getValue().toLowerCase().includes("mahindra")) {
                that.loadBillingData("M");
                oView.getModel("visModel").setProperty("/bajajVisible", false);
                oView.getModel("visModel").setProperty("/mahVisible", true);
                oView.getModel("visModel").setProperty("/endVisible", false);
                oView.getModel("visModel").setProperty("/pvplVisible", false);
                oView.byId("mahTitle").setText(oView.byId("custName").getValue());
                oView.byId("mahForm").setModel("mahDocModel");

            } else if (oView.byId("custName").getValue().toLowerCase().includes("endurance")) {
                that.loadBillingData("E");
                oView.getModel("visModel").setProperty("/bajajVisible", false);
                oView.getModel("visModel").setProperty("/mahVisible", false);
                oView.getModel("visModel").setProperty("/endVisible", true);
                oView.getModel("visModel").setProperty("/pvplVisible", false);
                oView.byId("endTitle").setText(oView.byId("custName").getValue());
                oView.byId("endForm").setModel("endModel");

            } else if (oView.byId("custName").getValue().toLowerCase().includes("piaggio")) {   //tempory..change to PVPL when deploying
                that.loadBillingData("P");
                oView.getModel("visModel").setProperty("/bajajVisible", false);
                oView.getModel("visModel").setProperty("/mahVisible", false);
                oView.getModel("visModel").setProperty("/endVisible", false);
                oView.getModel("visModel").setProperty("/pvplVisible", true);
                oView.byId("pvplTitle").setText(oView.byId("custName").getValue());
                oView.byId("pvplForm").setModel("pvplModel");

            } else {
                oView.getModel("visModel").setProperty("/bajajVisible", false);
                oView.getModel("visModel").setProperty("/mahVisible", false);
                oView.getModel("visModel").setProperty("/endVisible", false);
                oView.getModel("visModel").setProperty("/pvplVisible", false);
                oView.byId("pvplTitle").setValue("");
                oView.byId("endTitle").setValue("");
                oView.byId("mahTitle").setValue("");
                oView.byId("bajajTitle").setValue("");
            }
            oView.getModel("visModel").refresh();
        },
        loadBillingData: function (type) {
            var aFilters = [];
            var oFilter = new sap.ui.model.Filter("BillingDocument", FilterOperator.EQ, oView.byId("billingInput").getValue());
            aFilters.push(oFilter);
            var oBusyDialog = new BusyDialog();
            oBusyDialog.open();
            that.oDataModel.read("/billingDocItemDet", {
                urlParameters: that.oParameters,
                filters: aFilters,
                success: function (oData) {
                    if (oData.results.length > 0) {
                        if (type === "B") {
                            that.createBajajObj(oData.results);
                        } else if (type === "M") {
                            that.createMahindraObj(oData.results);
                        } else if (type === "E") {
                            that.createEnduranceObj(oData.results);
                        } else if (type === "P") {
                            that.createPVPLObj(oData.results);
                        }
                    } else {
                        MessageBox.show("No Data Found !")
                    }
                    oBusyDialog.close();
                },
                error: function (oError) {
                    MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                    oBusyDialog.close();
                }
            });
        },
        createPVPLObj: function (data) {
            var pObj = {};
            pObj.PurchaseOrderByCustomer = data[0].PurchaseOrderByCustomer;
            pObj.BillingDocument = data[0].BillingDocument;
            pObj.CustInvNo = data[0].CustInvNo;
            pObj.BillingDocumentDate = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" }).format(new Date(data[0].BillingDocumentDate));
            pObj.BillingQuantity = data[0].BillingQuantity;
            pObj.MaterialByCustomer = data[0].MaterialByCustomer;
            pObj.matBaseRate = data.find((element) => element.ConditionType === "ZDOM") ? parseFloat(data.find((element) => element.ConditionType === "ZDOM").ConditionRateAmount).toFixed(2) : "0.00";
            pObj.asseValue = data.find((element) => element.ConditionType === "ZDOM") ? parseFloat(data.find((element) => element.ConditionType === "ZDOM").ConditionAmount).toFixed(2) : "0.00";
            pObj.eXiseAmt = "0.00";
            //pObj.NetAmount = data[0].NetAmount;
            pObj.NetAmount = parseFloat(
                (parseFloat(data[0].NetAmount || 0) + parseFloat(data[0].TaxAmount || 0)).toFixed(2)
            );
            pObj.YY1_LRNO_DLH = data[0].YY1_LRNO_DLH;
            pObj.YY1_LR_DATE_DLH = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" }).format(new Date(data[0].YY1_LR_DATE_DLH));;
            pObj.IN_EDocEInvcVehicleNumber = data[0].IN_EDocEInvcVehicleNumber;
            pObj.IN_EDocEInvcTransptDocNmbr = data[0].IN_EDocEInvcTransptDocNmbr;

            oView.getModel("pvplModel").setData([pObj]);
            oView.getModel("pvplModel").refresh();
            oView.byId("pvplForm").bindElement({ path: "/0", model: "pvplModel" });
        },
        createEnduranceObj: function (data) {
            var eObj = {};
            eObj.PurchaseOrderByCustomer = data[0].PurchaseOrderByCustomer;
            eObj.BillingDocument = data[0].BillingDocument;
            eObj.CustInvNo = data[0].CustInvNo;
            eObj.BillingDocumentDate = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd-MM-yyyy" }).format(new Date(data[0].BillingDocumentDate));
            eObj.IN_EDocEInvcEWbillNmbr = data[0].IN_EDocEInvcEWbillNmbr;

            eObj.IN_EDocEInvcEWbillCreateDate = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd-MM-yyyy" }).format(new Date(data[0].IN_EDocEInvcEWbillCreateDate));
            eObj.IN_EDocEInvcVehicleNumber = data[0].IN_EDocEInvcVehicleNumber;

            eObj.MaterialByCustomer = data[0].MaterialByCustomer;

            eObj.UnderlyingPurchaseOrderItem = data[0].UnderlyingPurchaseOrderItem;

            eObj.eBaseRate = data.find((element) => element.ConditionType === "ZDOM") ? parseFloat(data.find((element) => element.ConditionType === "ZDOM").ConditionRateAmount).toFixed(2) : "0.00";

            eObj.BillingQuantity = data[0].BillingQuantity;

            // eObj.NetAmount = data[0].NetAmount + data[0].TaxAmount; shadab
            // Convert to numbers, add them, and round to 2 decimal places
            eObj.NetAmount = parseFloat(
                (parseFloat(data[0].NetAmount || 0) + parseFloat(data[0].TaxAmount || 0)).toFixed(2)
            );
            eObj.freight = "0.00";
            eObj.eAmort = "0.00";
            eObj.eTcs = "0.00";

            eObj.MaterialDescription = data[0].MaterialDescription;
            eObj.IN_ElectronicDocInvcRefNmbr = data[0].IN_ElectronicDocInvcRefNmbr === "" ? "0" : data[0].IN_ElectronicDocInvcRefNmbr;
            eObj.IN_ElectronicDocInvcRefNmbr = data[0].IN_ElectronicDocInvcRefNmbr
            oView.getModel("endModel").setData([eObj]);
            oView.getModel("endModel").refresh();
            oView.byId("endForm").bindElement({ path: "/0", model: "endModel" });
        },
        createMahindraObj: function (data) {
            var mObj = {};
            mObj.PurchaseOrderByCustomer = data[0].PurchaseOrderByCustomer;
            mObj.UnderlyingPurchaseOrderItem = data[0].UnderlyingPurchaseOrderItem;
            mObj.MaterialByCustomer = data[0].MaterialByCustomer;
            mObj.BillingQuantity = data[0].BillingQuantity;
            mObj.BillingDocument = data[0].BillingDocument;
            mObj.CustInvNo = data[0].CustInvNo;
            mObj.BillingDocumentDate = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" }).format(new Date(data[0].BillingDocumentDate));

            //mObj.NetAmount = data[0].NetAmount;
            // Convert to numbers, add them, and round to 2 decimal places
            mObj.NetAmount = parseFloat(
                (parseFloat(data[0].NetAmount || 0) + parseFloat(data[0].TaxAmount || 0)).toFixed(2)
            );
            mObj.IN_EDocEInvcVehicleNumber = data[0].IN_EDocEInvcVehicleNumber;
            mObj.matBasePrice = data.find((element) => element.ConditionType === "ZDOM") ? parseFloat(data.find((element) => element.ConditionType === "ZDOM").ConditionRateAmount).toFixed(2) : "0.00";
            mObj.venGST = data[0].Plant === "2100" || data[0].Plant === "2200" ? "33AABCM5791J1Z9" : "27AABCM5791J1Z2";
            mObj.GSTIN = data[0].GSTIN;
            mObj.eXiseAmt = "0.00";
            mObj.YY1_LRNO_DLH = data[0].YY1_LRNO_DLH;

            mObj.YY1_LR_DATE_DLH = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" }).format(new Date(data[0].YY1_LR_DATE_DLH));;
            mObj.IN_ElectronicDocInvcRefNmbr = data[0].IN_ElectronicDocInvcRefNmbr === "" ? "0" : data[0].IN_ElectronicDocInvcRefNmbr;

            oView.getModel("mahDocModel").setData([mObj]);
            oView.getModel("mahDocModel").refresh();
            oView.byId("mahForm").bindElement({ path: "/0", model: "mahDocModel" });
        },
        createBajajObj: function (data) {
            var bObj = {};
            bObj.addnTaxVal = "0.00",
                bObj.BillingDocument = data[0].BillingDocument,
                bObj.CustInvNo = data[0].CustInvNo,
                bObj.BillingDocumentDate = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyyMMdd" }).format(new Date(data[0].BillingDocumentDate)),
                bObj.PayerParty = data[0].PayerParty,
                bObj.BillingQuantity = data[0].BillingQuantity,
                bObj.NetAmount = data[0].NetAmount,
                bObj.TaxAmount = (parseFloat(data[0].NetAmount) + parseFloat(bObj.addnTaxVal)).toString(), // sum of NetAmount+ addnTax
                bObj.Plant = data[0].VendorPlant,
                bObj.IN_EDocEInvcEWbillNmbr = data[0].IN_EDocEInvcEWbillNmbr
            bObj.IN_EDocEInvcEWbillCreateDate = data[0].IN_EDocEInvcEWbillCreateDate === null ? "" : sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyyMMdd" }).format(new Date(data[0].IN_EDocEInvcEWbillCreateDate)),
                bObj.IN_EDocEInvcVehicleNumber = data[0].IN_EDocEInvcVehicleNumber,
                // bObj.IN_ElectronicDocInvcRefNmbr = data[0].IN_ElectronicDocInvcRefNmbr,
                bObj.IN_ElectronicDocQRCodeTxt = data[0].IN_ElectronicDocQRCodeTxt,
                bObj.DocumentDate = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyyMMdd" }).format(new Date(data[0].DocumentDate)),
                bObj.VendorCode = data[0].VendorCode,
                bObj.GSTIN = data[0].Plant === "2100" || data[0].Plant === "2200" ? "33AABCM5791J1Z9" : "27AABCM5791J1Z2",

                bObj.hsn = data[0].ConsumptionTaxCtrlCode.startsWith("99") || data[0].ConsumptionTaxCtrlCode.startsWith("0") || data[0].ConsumptionTaxCtrlCode.startsWith("S") ? "" : data[0].ConsumptionTaxCtrlCode,
                bObj.sac = data[0].ConsumptionTaxCtrlCode.startsWith("99") || data[0].ConsumptionTaxCtrlCode.startsWith("0") || data[0].ConsumptionTaxCtrlCode.startsWith("S") ? data[0].ConsumptionTaxCtrlCode : "",

                bObj.PurchaseOrderByCustomer = data[0].PurchaseOrderByCustomer,
                bObj.UnderlyingPurchaseOrderItem = data[0].UnderlyingPurchaseOrderItem,
                bObj.MaterialByCustomer = data[0].MaterialByCustomer,
                bObj.basicPrice = data.find((element) => element.ConditionType === "ZDOM") ? parseFloat(data.find((element) => element.ConditionType === "ZDOM").ConditionRateAmount).toFixed(2) : "0.00",
                bObj.basicValue = data.find((element) => element.ConditionType === "ZDOM") ? parseFloat(data.find((element) => element.ConditionType === "ZDOM").ConditionAmount).toFixed(2) : "0.00",

                bObj.freight = data.find((element) => element.ConditionType === "ZFRT") ? parseFloat(data.find((element) => element.ConditionType === "ZFRT").ConditionAmount).toFixed(2) : "0.00",

                bObj.PnFCharges = data.find((element) => element.ConditionType === "ZPK1") ? parseFloat(data.find((element) => element.ConditionType === "ZPK1").ConditionAmount).toFixed(2) : "0.00",

                bObj.cgst = data.find((element) => element.ConditionType === "JOCG") ? parseFloat(data.find((element) => element.ConditionType === "JOCG").ConditionRateValue).toFixed(2) : "0.00",
                bObj.cgstAmt = data.find((element) => element.ConditionType === "JOCG") ? parseFloat(data.find((element) => element.ConditionType === "JOCG").ConditionAmount).toFixed(2) : "0.00",

                bObj.sgst = data.find((element) => element.ConditionType === "JOSG") ? parseFloat(data.find((element) => element.ConditionType === "JOSG").ConditionRateValue).toFixed(2) : "0.00",
                bObj.sgstAmt = data.find((element) => element.ConditionType === "JOSG") ? parseFloat(data.find((element) => element.ConditionType === "JOSG").ConditionAmount).toFixed(2) : "0.00",

                bObj.igst = data.find((element) => element.ConditionType === "JOIG") ? parseFloat(data.find((element) => element.ConditionType === "JOIG").ConditionRateValue).toFixed(2) : "0.00",
                bObj.igstAmt = data.find((element) => element.ConditionType === "JOIG") ? parseFloat(data.find((element) => element.ConditionType === "JOIG").ConditionAmount).toFixed(2) : "0.00",

                bObj.utgst = "0.00",
                bObj.utgstAmt = "0.00",

                bObj.billAmt = (parseFloat(data[0].NetAmount) +
                    parseFloat(bObj.addnTaxVal) +
                    parseFloat(bObj.cgstAmt) +
                    parseFloat(bObj.sgstAmt) +
                    parseFloat(bObj.utgstAmt) +
                    parseFloat(bObj.igstAmt))
                    .toFixed(2); // This converts to string with 2 decimal places - Shadab
            //bObj.billAmt = (parseFloat(data[0].NetAmount) + parseFloat(bObj.addnTaxVal) + parseFloat(bObj.cgstAmt) + parseFloat(bObj.sgstAmt) + parseFloat(bObj.utgstAmt) + parseFloat(bObj.igstAmt)).toString(), // sum of NetAmount+ addnTax+cgstAmt+ sgstAmt+ utgstAmt+  igstAmt
            bObj.others = "0.00",

                bObj.billToSToC = "0",
                bObj.remarks = "0",
                bObj.delChallan = "0",
                bObj.delChallanDt = "0",
                bObj.delChallanAmt = "0",
                bObj.tcsVal = "0,";

            oView.getModel("bajajModel").setData([bObj]);
            oView.getModel("bajajModel").refresh();
            oView.byId("bajajFormH").bindElement({ path: "/0", model: "bajajModel" });
            oView.byId("bajajFormI").bindElement({ path: "/0", model: "bajajModel" });
        },
        exportExcelData: function (oEvent) {
            var aCols, oRowBinding, oSettings, oSheet, sExcelText;
            if (oView.byId("custName").getValue().toLowerCase().includes("bajaj")) {
                // oRowBinding = [];
                // oRowBinding = oView.getModel("bajajModel").getData();
                // aCols = that.createBajajConfig();   
                sExcelText = "BAJAJAUTOLIMITED1_" + oView.byId("billingInput").getValue() + "-edi-file";
                that.downloadBajajData(sExcelText);
                return;
            } else if (oView.byId("custName").getValue().toLowerCase().includes("mahindra")) {
                // oRowBinding = oView.getModel("mahDocModel").getData();
                // aCols = that.createMahindraConfig();
                sExcelText = oView.byId("custName").getValue() + "_" + oView.byId("billingInput").getValue();
                that.downloadMahData(sExcelText);
                return;
            } else if (oView.byId("custName").getValue().toLowerCase().includes("endurance")) {
                // oRowBinding = oView.getModel("endModel").getData();
                // aCols = that.createEnduranceConfig();
                sExcelText = oView.byId("custName").getValue() + "_" + oView.byId("billingInput").getValue();
                that.downloadEndData(sExcelText);
                return;
            } else if (oView.byId("custName").getValue().toLowerCase().includes("piaggio")) {
                // oRowBinding = oView.getModel("pvplModel").getData();
                // aCols = that.createPVPLConfig();
                sExcelText = oView.byId("custName").getValue() + "_" + oView.byId("billingInput").getValue();
                that.downloadPVPLData(sExcelText);
            } else {
                return;
            }
            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: sExcelText,
                worker: false
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },
        downloadPVPLData: function (sExcelText) {
            const data = oView.getModel("pvplModel").getData()[0];
            var rows = [];
            const titleKeys = [
                that.i18n.getText("pposarno"),
                that.i18n.getText("pinvno"),
                that.i18n.getText("pinvdt"),
                that.i18n.getText("pmatcode"),
                that.i18n.getText("pasnqty"),
                that.i18n.getText("pmatprice"),
                that.i18n.getText("passebleval"),
                that.i18n.getText("pbasexduty"),
                that.i18n.getText("pgrossinvamt"),
                that.i18n.getText("plrno"),
                that.i18n.getText("plrdt"),
                that.i18n.getText("pvehno"),
                that.i18n.getText("ptransno")
            ]
            rows.push(titleKeys);

            var tempArr = [
                data.PurchaseOrderByCustomer,
                data.CustInvNo,
                data.BillingDocumentDate,
                data.MaterialByCustomer,
                data.BillingQuantity,
                data.matBaseRate,
                data.asseValue,
                data.eXiseAmt,
                data.NetAmount,
                data.YY1_LRNO_DLH,
                data.YY1_LR_DATE_DLH,
                data.IN_EDocEInvcVehicleNumber,
                data.IN_EDocEInvcTransptDocNmbr
            ];
            rows.push(tempArr);
            let csvContent = ''

            rows.forEach(row => {
                csvContent += row.join(',') + '\n'
            });
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' });

            // const blob = new Blob(rows, { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            var downloadLink = document.createElement("a");
            downloadLink.href = url;
            downloadLink.download = sExcelText + ".csv";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        },
        downloadEndData: function (sExcelText) {
            const data = oView.getModel("endModel").getData()[0];
            var rows = [];
            const titleKeys = [
                that.i18n.getText("eposano"),
                that.i18n.getText("einvno"),
                that.i18n.getText("einvdt"),
                that.i18n.getText("eewaybillno"),
                that.i18n.getText("eewaybilldt"),
                that.i18n.getText("evehno"),
                that.i18n.getText("elineitem"),
                that.i18n.getText("ematerial"),
                that.i18n.getText("edesc"),
                that.i18n.getText("ebasrate"),
                that.i18n.getText("einvqty"),
                that.i18n.getText("efreight"),
                that.i18n.getText("eamort"),
                that.i18n.getText("etcs"),
                that.i18n.getText("eirn"),
                that.i18n.getText("ebillamt")
            ]
            rows.push(titleKeys);

            var tempArr = [
                data.PurchaseOrderByCustomer,
                data.CustInvNo,
                data.BillingDocumentDate,
                data.IN_EDocEInvcEWbillNmbr,
                data.IN_EDocEInvcEWbillCreateDate,
                data.IN_EDocEInvcVehicleNumber,
                data.UnderlyingPurchaseOrderItem,
                data.MaterialByCustomer,
                data.MaterialDescription,
                data.eBaseRate,
                data.BillingQuantity,
                data.freight,
                data.eAmort,
                data.eTcs,
                data.IN_ElectronicDocInvcRefNmbr,
                data.NetAmount
            ];
            rows.push(tempArr);
            let csvContent = ''

            rows.forEach(row => {
                csvContent += row.join(',') + '\n'
            });
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' });

            // const blob = new Blob(rows, { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            var downloadLink = document.createElement("a");
            downloadLink.href = url;
            downloadLink.download = sExcelText + ".csv";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        },
        //Mahindra Text download format
        downloadMahData: function (sExcelText) {
            const data = oView.getModel("mahDocModel").getData()[0];
            var rows = [];
            const titleKeys = [
                that.i18n.getText("mposano"),
                that.i18n.getText("mitemsrno"),
                that.i18n.getText("mpartno"),
                that.i18n.getText("masnqty"),
                that.i18n.getText("minvno"),
                that.i18n.getText("minvdt"),
                that.i18n.getText("minvamtintcs"),
                that.i18n.getText("mexiseamt"),
                that.i18n.getText("mlrno"),
                that.i18n.getText("mlrdt"),
                that.i18n.getText("mvehno"),
                that.i18n.getText("mmatbaspr"),
                that.i18n.getText("mirnno"),
                that.i18n.getText("mvengst"),
                that.i18n.getText("mmahgst")
            ]
            rows.push(titleKeys);

            var tempArr = [
                data.PurchaseOrderByCustomer,
                data.UnderlyingPurchaseOrderItem,
                data.MaterialByCustomer,
                data.BillingQuantity,
                data.CustInvNo,
                // data.BillingDocument,
                data.BillingDocumentDate,
                data.NetAmount,
                data.eXiseAmt,
                data.YY1_LRNO_DLH,
                data.YY1_LR_DATE_DLH,
                data.IN_EDocEInvcVehicleNumber,
                data.matBasePrice,
                //data.IN_ElectronicDocInvcRefNmbrb, -- Shadab
                data.IN_ElectronicDocInvcRefNmbr,
                data.venGST,
                data.GSTIN
            ];
            rows.push(tempArr);
            let csvContent = ''

            rows.forEach(row => {
                csvContent += row.join(',') + '\n'
            });
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' });
            const url = URL.createObjectURL(blob);
            var downloadLink = document.createElement("a");
            downloadLink.href = url;
            downloadLink.download = sExcelText + ".csv";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        },
        downloadBajajData: function (sExcelText) {
            const data = oView.getModel("bajajModel").getData()[0];
            var tempArr = [
                data.Plant,
                data.VendorCode,
                data.GSTIN,
                data.hsn,
                data.sac,
                data.MaterialByCustomer,
                data.PurchaseOrderByCustomer,
                data.UnderlyingPurchaseOrderItem,
                data.CustInvNo,
                // data.BillingDocument,
                data.BillingDocumentDate,
                data.BillingQuantity,
                data.basicPrice,
                data.basicValue,
                data.freight,
                data.PnFCharges,
                data.others,
                data.NetAmount,
                data.addnTaxVal,
                data.TaxAmount,
                data.cgst,
                data.cgstAmt,
                data.sgst,
                data.sgstAmt,
                data.utgst,
                data.utgstAmt,
                data.igst,
                data.igstAmt,
                data.billAmt,
                data.IN_EDocEInvcEWbillNmbr,
                data.IN_EDocEInvcEWbillCreateDate,
                data.IN_EDocEInvcVehicleNumber,
                data.billToSToC,
                data.remarks,
                data.IN_ElectronicDocQRCodeTxt,
                data.delChallan,
                data.delChallanDt,
                data.delChallanAmt,
                data.tcsVal
            ];
            var rows = [tempArr];
            // let csvContent = "data:text/csv;charset=utf-8,";
            // rows.forEach(function (rowArray) {
            //     let row = rowArray.join(",");
            //     csvContent += row + "\r\n";
            // });
            const blob = new Blob(rows, { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            var downloadLink = document.createElement("a");
            // downloadLink.href = csvContent;
            downloadLink.href = url;
            downloadLink.download = sExcelText + ".txt";

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);

        },
        // createBajajConfig: function () {
        //     var bData = oView.getModel("bajajModel").getData()[0];
        //     var aCols = [];
        //     aCols.push({
        //         label: that.i18n.getText("bplant"),
        //         property: 'Plant',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bvcode"),
        //         property: 'VendorCode',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bgstnno"),
        //         property: 'GSTIN',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bhsn"),
        //         property: 'hsn',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bsac"),
        //         property: 'sac',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bitemcd"),
        //         property: 'MaterialByCustomer',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bpono"),
        //         property: 'PurchaseOrderByCustomer',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("blineno"),
        //         property: 'UnderlyingPurchaseOrderItem',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("binvno"),
        //         property: 'BillingDocument',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("binvdt"),
        //         property: 'BillingDocumentDate',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("binvqty"),
        //         property: 'BillingQuantity',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bbasicrt"),
        //         property: 'basicPrice',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bbasicval"),
        //         property: 'basicValue',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bfreight"),
        //         property: 'freight',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bpnf"),
        //         property: 'PnFCharges',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bothers"),
        //         property: 'others',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bsum"),
        //         property: 'NetAmount',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("baddntaxval"),
        //         property: 'addnTaxVal',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("btaxbase"),
        //         property: 'TaxAmount',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bcgst"),
        //         property: 'cgst',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bcgstamt"),
        //         property: 'cgstAmt',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bsgst"),
        //         property: 'sgst',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bsgstamt"),
        //         property: 'sgstAmt',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("butgst"),
        //         property: 'utgst',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("butgstamt"),
        //         property: 'utgstAmt',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bisgt"),
        //         property: 'igst',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bigstamt"),
        //         property: 'igstAmt',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bbillamt"),
        //         property: 'NetAmount',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bewaybill"),
        //         property: 'IN_EDocEInvcEWbillNmbr',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bewaybilldt"),
        //         property: 'IN_EDocEInvcEWbillCreateDate',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bvehicleno"),
        //         property: 'IN_EDocEInvcVehicleNumber',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bbilltoshipcd"),
        //         property: 'billToSToC',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bremarks"),
        //         property: 'remarks',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bsignedqr"),
        //         property: 'IN_ElectronicDocQRCodeTxt',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bdelchallan"),
        //         property: 'delChallan',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bdelchallandt"),
        //         property: 'delChallanDt',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("bdelchallanamt"),
        //         property: 'delChallanAmt',
        //         type: EdmType.String
        //     });

        //     aCols.push({
        //         label: that.i18n.getText("btcsval"),
        //         property: 'tcsVal',
        //         type: EdmType.String
        //     });
        //     return aCols;
        // },
        createMahindraConfig: function () {
            var aCols = [];
            aCols.push({
                label: that.i18n.getText("mposano"),
                property: 'PurchaseOrderByCustomer',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("mitemsrno"),
                property: 'UnderlyingPurchaseOrderItem',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("mpartno"),
                property: 'MaterialByCustomer',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("masnqty"),
                property: 'BillingQuantity',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("minvno"),
                property: 'CustInvNo',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("minvdt"),
                property: 'BillingDocumentDate',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("minvamtintcs"),
                property: 'NetAmount',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("mexiseamt"),
                property: 'eXiseAmt',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("mlrno"),
                property: 'YY1_LRNO_DLH',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("mlrdt"),
                property: 'YY1_LR_DATE_DLH',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("mvehno"),
                property: 'IN_EDocEInvcVehicleNumber',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("mmatbaspr"),
                property: 'matBasePrice',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("mirnno"),
                property: 'IN_ElectronicDocInvcRefNmbr',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("mvengst"),
                property: 'venGST',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("mmahgst"),
                property: 'GSTIN',
                type: EdmType.String
            });
            return aCols;
        },

        createEnduranceConfig: function () {
            var aCols = [];
            aCols.push({
                label: that.i18n.getText("eposano"),
                property: 'PurchaseOrderByCustomer',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("einvno"),
                property: 'CustInvNo',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("einvdt"),
                property: 'BillingDocumentDate',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("eewaybillno"),
                property: 'IN_EDocEInvcEWbillNmbr',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("eewaybilldt"),
                property: 'IN_EDocEInvcEWbillCreateDate',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("evehno"),
                property: 'IN_EDocEInvcVehicleNumber',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("elineitem"),
                property: 'UnderlyingPurchaseOrderItem',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("ematerial"),
                property: 'MaterialByCustomer',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("edesc"),
                property: 'MaterialDescription',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("ebasrate"),
                property: 'eBaseRate',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("einvqty"),
                property: 'BillingQuantity',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("efreight"),
                property: 'freight',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("eamort"),
                property: 'eAmort',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("etcs"),
                property: 'eTcs',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("eirn"),
                property: 'IN_ElectronicDocInvcRefNmbr',
                type: EdmType.String
            });
            aCols.push({
                label: that.i18n.getText("ebillamt"),
                property: 'NetAmount',
                type: EdmType.String
            });
            return aCols;
        },
        createPVPLConfig: function () {
            var aCols = [];
            aCols.push({
                label: that.i18n.getText("pposarno"),
                property: 'PurchaseOrderByCustomer',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("pinvno"),
                property: 'CustInvNo',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("pinvdt"),
                property: 'BillingDocumentDate',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("pmatcode"),
                property: 'MaterialByCustomer',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("pasnqty"),
                property: 'BillingQuantity',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("pmatprice"),
                property: 'matBaseRate',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("passebleval"),
                property: 'asseValue',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("pbasexduty"),
                property: 'eXiseAmt',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("pgrossinvamt"),
                property: 'NetAmount',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("plrno"),
                property: 'YY1_LRNO_DLH',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("plrdt"),
                property: 'YY1_LR_DATE_DLH',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("pvehno"),
                property: 'IN_EDocEInvcVehicleNumber',
                type: EdmType.String
            });

            aCols.push({
                label: that.i18n.getText("ptransno"),
                property: 'IN_EDocEInvcTransptDocNmbr',
                type: EdmType.String
            });
            return aCols;
        }
    });
});