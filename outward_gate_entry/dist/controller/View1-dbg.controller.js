sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/format/DateFormat",
    "sap/m/library",
    'sap/ui/core/library',
    'com/scp/fiori/outwardgateentry/model/formatter'
], (Controller, Dialog, Button, MessageBox, MessageToast, DateFormat, mobileLibrary, coreLibrary, formatter) => {
    "use strict";

    let ValueState = coreLibrary.ValueState;
    //let dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "YYYY/MM/DD" });
    let ButtonType = mobileLibrary.ButtonType;

    return Controller.extend("com.scp.fiori.outwardgateentry.controller.View1", {
        formatter: formatter,  // attach the formatter function
        onInit() {
            let that = this;
            this.vehicleTypes = [];
            this.aTransporterList = [];
            this.aBillingDocList = [];
            this.aUniqueBillingDocList = [];

            this.aMaterialData = [];
            this.aUniqueMaterial = [];

            this.oParameters = {
                "$top": 20000
            };

            /*let currentYear = new Date().getFullYear();
            let currentMonth = new Date().getMonth();
            if (currentMonth < 3) {
                currentYear = currentYear - 1;
            }
            this.byId("idFiscalYear").setValue(currentYear);*/
            let tDate = new Date();
            let oDateFormat = DateFormat.getInstance({
                pattern: "MMM dd, yyyy"
            });
            let formattedDate = oDateFormat.format(tDate);
            this.byId("idDate").setValue(formattedDate);
            let currentTime = `${tDate.getHours()}:${tDate.getMinutes()}:${tDate.getSeconds()}`;
            this.byId("idTime").setValue(currentTime);

            this.ZB_OUT_GATE_Model = this.getOwnerComponent().getModel();
            setTimeout(function () {
                that.getPlantData();
                that.getVehicleTypes();
                that.getTransporter();
            }, 400);

            let oModel = new sap.ui.model.json.JSONModel([]);
            this.getView().byId("idTable_OutwardItem").setModel(oModel);
            this.onAddOutwardItem(); //add initial record in the Outward Item table
        },

        onSelectPlant: function (oEvent) {
            let oValidatedComboBox = oEvent.getSource(),
                sSelectedKey = oValidatedComboBox.getSelectedKey(),
                sValue = oValidatedComboBox.getValue();
            if (!sSelectedKey && sValue) {
                oValidatedComboBox.setValueState(ValueState.Error);
                oValidatedComboBox.setValueStateText("Invalid Value");
            } else {
                oValidatedComboBox.setValueState(ValueState.None);
                //this.clearFieldsOnClearPlant();
                this.getBillingDocList(sSelectedKey); //load material/product list
                // this.getMaretial(sSelectedKey); //load material/product list
            }
        },

        onSelectVehicalType: function (oEvent) {
            let oValidatedComboBox = oEvent.getSource(),
                sSelectedKey = oValidatedComboBox.getSelectedKey(),
                sValue = oValidatedComboBox.getValue();
            if (!sSelectedKey && sValue) {
                oValidatedComboBox.setValueState(ValueState.Error);
                oValidatedComboBox.setValueStateText("Invalid Value");
            } else {
                oValidatedComboBox.setValueState(ValueState.None);
            }
        },

        getPlantData: function () {
            let that = this;
            let plantModel = new sap.ui.model.json.JSONModel();
            this.ZB_OUT_GATE_Model.read("/PlantF4Help", {
                urlParameters: this.oParameters,
                success: function (oResponse) {
                    plantModel.setData(oResponse.results);
                    that.getView().byId("idDropdownPlant").setModel(plantModel);
                },
                error: function (oError) {
                    MessageBox.error("Failed to load plant list");
                }
            });
        },

        getVehicleTypes: function () {
            this.vehicleTypes = [
                { VehicleType: '1109 TRUCK' },
                { VehicleType: '1612 TRUCK' },
                { VehicleType: '407 TEMPO' },
                { VehicleType: '709 TRUCK' },
                { VehicleType: '909 TRUCK' },
                { VehicleType: 'AUTO RICKSHAW' },
                { VehicleType: 'CONTAINER 14 FT' },
                { VehicleType: 'CONTAINER 20 FT' },
                { VehicleType: 'CONTAINER 30 FT' },
                { VehicleType: 'CONTAINER 40 FT' },
                { VehicleType: 'LOADING RICKSHAW 3W' },
                { VehicleType: 'LOADING RICKSHAW 4W' },
                { VehicleType: 'OPEN TRAILER' },
                { VehicleType: 'OWN VECH/BYHAND/COURIER' },
                { VehicleType: 'PICK-UP' }
            ];
            let vModel = new sap.ui.model.json.JSONModel();
            vModel.setData(this.vehicleTypes);
            this.getView().byId("idVehicalType").setModel(vModel);
        },

        getTransporter: function () {
            this.aTransporterList = [
                { "Transporter": "SRIPRIYA CARRIERS" },
                { "Transporter": "SLS TRANSPORT" },
                { "Transporter": "SWARAJ LOGISTICS" },
                { "Transporter": "CITY TRANSPORT" },
                { "Transporter": "SAIKRISHNA TRANSLINE" },
                { "Transporter": "SANTKRUPA ROADWAYS" },
                { "Transporter": "BHARATH SWIFT LOGISTICS" },
                { "Transporter": "SIDHNATH" },
                { "Transporter": "KARTIK TRANSPORT" },
                { "Transporter": "KAILASH ROAD LINES" },
                { "Transporter": "ANGEL TRANSPORT" },
                { "Transporter": "BHAGWAT TRANSPORT" },
                { "Transporter": "SANTKRUPA" },
                { "Transporter": "BHAGWAT TRANSPORT." },
                { "Transporter": "NIKHIL CARGO SERVICES" },
                { "Transporter": "SIDDHANATH" },
                { "Transporter": "SRI VENKATESHWARA TRANSPORTS" },
                { "Transporter": "BHAGWAT TRANSPOR" },
                { "Transporter": "MEGHA INDUSTRAL ELECTRONICS" },
                { "Transporter": "COMPANY VEHICLE" },
                { "Transporter": "SIDHNATH ROADLINES" },
                { "Transporter": "KAMAL CED LLP" },
                { "Transporter": "RAREWALA TRANSPORT" },
                { "Transporter": "VENNILA TRANSPORT" },
                { "Transporter": "METEORIC LOGISTICS PVT LTD" },
                { "Transporter": "SRI CHAMUDESWARI TRANSPORT" },
                { "Transporter": "SLV TRANSPORT" },
                { "Transporter": "TUBE INVESTMENTS" },
                { "Transporter": "AADHIR TRANSPORT" },
                { "Transporter": "AYUSH ENGINEERING" },
                { "Transporter": "BHUSAN POWER" },
                { "Transporter": "GANESHA TRANSPORT" },
                { "Transporter": "JAYA SHREE RAM CARRIERS" },
                { "Transporter": "KPR TUBES" },
                { "Transporter": "MAX TRANSPORT" },
                { "Transporter": "METEORIC LOGISTICS P LTD" },
                { "Transporter": "MMT SUPPLY CHAIN SYSTEMS" },
                { "Transporter": "PARTI VEHICLE" },
                { "Transporter": "SAI KRISNA  TRANS SOLUTIONS" },
                { "Transporter": "SHREE KRISHNA ISPAT" },
                { "Transporter": "SRI PRIYA" },
                { "Transporter": "SRI PRIYA CARRIERS" },
                { "Transporter": "SRI VENKATESHWARA TRANSPORT" },
                { "Transporter": "SRIPRIYA CAARRIERS" },
                { "Transporter": "JAYA SRIRAM CARRIERS" },
                { "Transporter": "KPR TRANSPORT" },
                { "Transporter": "NAVALADIAN TRANSPORT" },
                { "Transporter": "VINAY ROADLINES" },
                { "Transporter": "JAI DURGA TRANSPORT CO" },
                { "Transporter": "KPR YTRANSPORT" },
                { "Transporter": "GANESH WANKHEDE" },
                { "Transporter": "PARTY VEHICLE" },
                { "Transporter": "GANESH PRALHAD WANKHADE" },
                { "Transporter": "MEENA KOTHAWADE" },
                { "Transporter": "MEENA KOTHWADE" },
                { "Transporter": "VENNILA CARRIERS" },
                { "Transporter": "VANITA TRANSPORT" },
                { "Transporter": "MALIKARJUN RAMLING SWAMI" },
                { "Transporter": "WAGHMARE TRANSPORT" },
                { "Transporter": "SHRI SAWMISAMARTH TRANSPORT" },
                { "Transporter": "KOTHWADE" },
                { "Transporter": "SATYAM ROAD LINES" },
                { "Transporter": "SIDDHNATH" },
                { "Transporter": "SIDHANATH" },
                { "Transporter": "MOHATA DEVI TRANSPORT" },
                { "Transporter": "VANITA TRANSPORT SERVICE" },
                { "Transporter": "BHAGAWAT TRANSPORT" },
                { "Transporter": "PRECIFAB PARTY VEHICLE" },
                { "Transporter": "CONTINENTAL CARRIERS OF INDIA" },
                { "Transporter": "CONTINENTAL CARRIERS OF INDIA(CCI T" },
                { "Transporter": "CONTINENTAL CARRIERS OF INDIA   (C" },
                { "Transporter": "JAI DURGA  TRANSPORT CO." },
                { "Transporter": "JAI DURGA TRANSPORT CO." },
                { "Transporter": "ASSOCIATED ROAD CARRIERS LTD" },
                { "Transporter": "CCI TRANSPORT" },
                { "Transporter": "CHAITANYA ROADLINES" },
                { "Transporter": "DELHIVERY FRIGHT SERVICES PVT. LTD." },
                { "Transporter": "NATIONAL ROAD CARRIERS" },
                { "Transporter": "ROAD TRANSHIPERS OF INDIA" },
                { "Transporter": "VISHVAJIEET EXPRESS SERVICES" }
            ];

            /*this.aTransporterList = [
                { Transporter: "CHOUDHARY ROADLINES" },
                { Transporter: "ARVIND ROADLINES" },
                { Transporter: "BHAGWAT MUTTE" },
                { Transporter: "BHAGWAT TRANSPORT SERVICES" },
                { Transporter: "METEORIC LOGISTICS PVT. LTD" },
                { Transporter: "SANGAM LOGISTIC SERVICES" },
                { Transporter: "CHANDRAKANT MUTHE" },
                { Transporter: "G R LOGISTICS" },
                { Transporter: "G S TRANSPORT CORPORATION" },
                { Transporter: "ARCHANA ROADLINES CORPORTION" },
                { Transporter: "VISHWAMBHAR ARJUN WAGHMARE" },
                { Transporter: "GANESH WANKHEDE" },
                { Transporter: "VRL LOGISTICS LTD" },
                { Transporter: "HARSHADA CRANE SERVICES" }
            ];*/

            /*let that = this;
            this.f4HelpModel.read("/TransporterF4Help", {
                urlParameters: this.oParameters,
                success: function (oResponse) {
                    that.aTransporterList = oResponse.results;
                },
                error: function (oError) {
                    MessageBox.error("Failed to load transporter list");
                    console.log(oError);
                }
            });*/
        },

        getBillingDocList: function (sPlant) {
            let that = this;
            that.aBillingDocList = [];
            that.aUniqueBillingDocList = [];
            // let oSorter = new sap.ui.model.Sorter("DocumentDate", false);
            let filter = new sap.ui.model.Filter({
                path: "Plant",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: sPlant
            });
            this.ZB_OUT_GATE_Model.read("/BillingDocOut", {
                filters: [filter],
                // sorter: [oSorter],
                urlParameters: {
                    ...this.oParameters,
                    "$orderby": "DocumentDate desc" // or "asc"
                },
                success: function (oResponse) {
                    that.aBillingDocList = oResponse.results.sort((a, b) => {
                        const dateA = new Date(a.DocumentDate);
                        const dateB = new Date(b.DocumentDate);
                        // Return comparison result (descending order)
                        return dateB - dateA;
                    });
                    const key = 'BillingDocument';
                    that.aUniqueBillingDocList = [...new Map(that.aBillingDocList.map(item =>
                        [item[key], item])).values()];
                },
                error: function (oError) {
                    MessageBox.error("Failed to load Billing Document List");
                    console.log(oError);
                }
            });
        },

        transporterValueHelp: function (oEvent) {
            try {
                let that = this;
                let selectedInput = oEvent.getSource();
                let oCustomListItem = new sap.m.StandardListItem({
                    active: true,
                    title: "{Transporter}"
                });

                let oSelectDialog = new sap.m.SelectDialog({
                    title: "Select Transporter",
                    noDataText: "No Data",
                    width: "50%",
                    growing: true,
                    growingThreshold: 12,
                    growingScrollToLoad: true,
                    confirm: function (oEvent) {
                        let aContexts = oEvent.getParameter("selectedContexts");
                        if (aContexts.length) {
                            let selectedValue = aContexts.map(function (oContext) {
                                return oContext.getObject();
                            });
                            selectedInput.setValue(selectedValue[0].Transporter);
                        }
                    },
                    liveChange: function (oEvent) {
                        let sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("Transporter", sap.ui.model.FilterOperator.Contains, sValue);
                        /*let oFilter = new Filter({
                            filters: [
                                new sap.ui.model.Filter("Transporter", sap.ui.model.FilterOperator.Contains, sValue)
                                new sap.ui.model.Filter("Transporter_Description", sap.ui.model.FilterOperator.Contains, sValue)
                            ]
                        });*/

                        let oBinding = oEvent.getSource().getBinding("items");
                        oBinding.filter(oFilter);
                        //oBinding.filter([oFilter]);
                    }
                });
                let oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
                    modelData: this.aTransporterList //view.getModel("searchModel").getData().searchModel
                });
                oSelectDialog.setModel(oModel);
                oSelectDialog.bindAggregation("items", "/modelData", oCustomListItem);
                oSelectDialog.open();
            } catch (e) {
                that.getView().setBusy(false);
            }
        },

        billingNumValueHelp: function (oEvent) {
            try {
                let that = this;
                let selectedInput = oEvent.getSource();
                let oCustomListItem = new sap.m.StandardListItem({
                    active: true,
                    title: "{BillingDocument}",
                    //description: "{DocumentDate}"
                    // description: "{path: 'DocumentDate', formatter: '.formatDate'}"
                    //description: "{path: 'DocumentDate', formatter: 'formatter.formatDate'}"
                    description: {
                        path: "DocumentDate",
                        formatter: function (s) {
                            return formatter.formatDate(s)
                        }
                    }
                });

                let oSelectDialog = new sap.m.SelectDialog({
                    title: "Select Billing Document No.",
                    noDataText: "No Data",
                    width: "50%",
                    growing: true,
                    growingThreshold: 12,
                    growingScrollToLoad: true,
                    confirm: function (oEvent) {
                        let aContexts = oEvent.getParameter("selectedContexts");
                        if (aContexts.length) {
                            let selectedValue = aContexts.map(function (oContext) {
                                return oContext.getObject();
                            });
                            let isSameBillingNoSelected = false;
                            that.getView().byId("idTable_OutwardItem").getModel().getData().forEach(item => {
                                if (item.BillingDocument === selectedValue[0].BillingDocument) {
                                    isSameBillingNoSelected = true;
                                }
                            });
                            if (isSameBillingNoSelected) {
                                MessageBox.error(`Billing Document Number ${selectedValue[0].BillingDocument} is already selected`);
                            }
                            else {
                                selectedInput.setValue(selectedValue[0].BillingDocument);
                                selectedInput.getBindingContext().getObject().ODNNumber = selectedValue[0].ODNNumber;
                                selectedInput.getBindingContext().getObject().IN_EDocEInvcEWbillNmbr = selectedValue[0].IN_EDocEInvcEWbillNmbr;
                                selectedInput.getBindingContext().getObject().IN_EDocEInvcTransptDocNmbr = selectedValue[0].IN_EDocEInvcTransptDocNmbr;
                                selectedInput.getModel().refresh();
                            }
                        }
                    },
                    liveChange: function (oEvent) {
                        let sValue = oEvent.getParameter("value");
                        let custFilter = new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("BillingDocument", sap.ui.model.FilterOperator.Contains, sValue)
                            ]
                        });
                        let oBinding = oEvent.getSource().getBinding("items");
                        oBinding.filter([custFilter]);
                    }
                });
                let oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
                    modelData: that.aUniqueBillingDocList
                });
                oSelectDialog.setModel(oModel);
                oSelectDialog.bindAggregation("items", "/modelData", oCustomListItem);
                oSelectDialog.open();
            } catch (e) {
                console.log(e);
            }
        },

        onAddOutwardItem: function () {
            let OutwardTable = this.getView().byId("idTable_OutwardItem");
            let OutwardTableData = OutwardTable.getModel().getData();
            let tData = {};
            if (OutwardTableData.length === 0) {
                tData = {
                    Itemno: "10",
                    BillingDocument: "",
                    ODNNumber: "",
                    IN_EDocEInvcEWbillNmbr: "",
                    IN_EDocEInvcTransptDocNmbr: ""
                };
            }
            else {
                let maxItemNum = Math.max(...OutwardTableData.map(item => parseInt(item.Itemno)));
                tData = {
                    Itemno: (maxItemNum + 10).toString(),
                    BillingDocument: "",
                    ODNNumber: "",
                    IN_EDocEInvcEWbillNmbr: "",
                    IN_EDocEInvcTransptDocNmbr: ""
                };
            }
            OutwardTableData.push(tData);
            OutwardTable.getModel().refresh();
        },

        onDeleteOutwardItem: function (oEvent) {
            let OutwardTable = this.getView().byId("idTable_OutwardItem");
            let OutwardTableData = OutwardTable.getModel().getData();
            let sPath = oEvent.getSource().getBindingContext().getPath(); //.split("/")[1];
            let iIndex = parseInt(sPath.substring(sPath.lastIndexOf("/") + 1), 10);
            OutwardTableData.splice(iIndex, 1);
            OutwardTable.getModel().refresh();
        },

        onSave: function () {
            let that = this;
            let oView = this.getView();
            let Plant = oView.byId("idDropdownPlant").getSelectedKey(),
                VehicalType = oView.byId("idVehicalType").getSelectedKey(),
                Transporter = oView.byId("id_Trasporter").getValue(),
                VehicalNo = oView.byId("idVehicalNo").getValue(),
                sDate = oView.byId("idDate").getValue(),
                sTime = oView.byId("idTime").getValue();
            if (!(Plant) || !(VehicalType) || Transporter === "" || VehicalNo === "") {
                MessageToast.show("Fill all mandatory fields");
                return;
            }
            let oDateFormat = DateFormat.getInstance({
                pattern: "yyyy-MM-dd'T'00:00:00"
            });
            let SystemDate = oDateFormat.format(new Date(sDate)),
                time = sTime.split(":"),
                hours = time[0].length === 1 ? ('0' + time[0]) : time[0],
                SystemTime = `PT${hours}H${time[1]}M${time[1]}S`;

            let isFilledAllTableItems = true;
            var itemData = [];
            this.getView().byId("idTable_OutwardItem").getModel().getData().filter(item => {
                if (item.BillingDocument === "" || item.ODNNumber === "" || item.IN_EDocEInvcEWbillNmbr === "" || item.IN_EDocEInvcTransptDocNmbr === "") {
                    isFilledAllTableItems = false;
                }
                let obj = {
                    "Itemno": item.Itemno,
                    "Billingno": item.BillingDocument,
                    "Odnnumber": item.ODNNumber,
                    "Ewaybill": item.IN_EDocEInvcEWbillNmbr,
                    "Lrnumber": item.IN_EDocEInvcTransptDocNmbr
                };
                itemData.push(obj);
            });
            if (!isFilledAllTableItems) {
                MessageToast.show("Fill all the table fields");
                return;
            }

            let payload = {
                "Plant": Plant,
                "Vehicletype": VehicalType,
                "Vehicleno": VehicalNo,
                "Transporter": Transporter,
                "Qrcode": "",
                "SystemDate": SystemDate,
                "SystemTime": SystemTime,
                "to_item": itemData
            };

            /* var dialog = new Dialog({
                 title: 'Success',
                 type: 'Message',
                 state: 'Success',
                 content: new sap.m.Text({
                     text: `Gate Entry Number 0000000010 generated successfully`
                 }),
                 beginButton: new Button({
                     text: 'Ok',
                     press: function () {
                         dialog.close();
                     }
                 }),
                 afterClose: function () {
                     dialog.destroy();
                 }
             });
             dialog.open();*/

            that.getView().setBusy(true);
            this.ZB_OUT_GATE_Model.create("/OutwardGateHeader", payload, {
                method: "POST",
                success: function (oData, oResponse) {
                    that.getView().setBusy(false);
                    let gateEntryNo = oResponse.data.GateEntryId;
                    console.log(oResponse);
                    var dialog = new Dialog({
                        title: 'Success',
                        type: 'Message',
                        state: 'Success',
                        content: new sap.m.Text({
                            text: `Gate Entry Number ${gateEntryNo} generated successfully`
                        }),
                        beginButton: new Button({
                            text: 'Ok',
                            press: function () {
                                that.clearFieldsOnScreen();
                                dialog.close();
                            }
                        }),
                        afterClose: function () {
                            dialog.destroy();
                        }
                    });
                    dialog.open();
                },
                error: function (e) {
                    that.getView().setBusy(false);
                    if (e.responseText && (e.statusCode === 400 || e.statusCode === "400")) {
                        var err = JSON.parse(e.responseText);
                        var msg = err.error.message.value;
                    } else if (e.responseText && (e.statusCode === 500 || e.statusCode === "500")) {
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(e.responseText, "text/xml");
                        var msg = xmlDoc.documentElement.childNodes[1].innerHTML;
                    } else {
                        var msg = e.message;
                    }
                    var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
                    MessageBox.error(
                        msg, {
                        styleClass: bCompact ? "sapUiSizeCompact" : ""
                    }
                    );
                }
            });
        },

        clearFieldsOnScreen: function () {
            let oView = this.getView();
            oView.byId("idDropdownPlant").setSelectedKey();
            oView.byId("idDropdownPlant").setValue();
            oView.byId("idVehicalType").setSelectedKey();
            oView.byId("idVehicalType").setValue();
            oView.byId("id_Trasporter").setValue();
            oView.byId("idVehicalNo").setValue();
            let oDateFormat = DateFormat.getInstance({
                pattern: "MMM dd, yyyy"
            });
            let tDate = new Date();
            let formattedDate = oDateFormat.format(tDate);
            this.byId("idDate").setValue(formattedDate);
            let currentTime = `${tDate.getHours()}:${tDate.getMinutes()}:${tDate.getSeconds()}`;
            this.byId("idTime").setValue(currentTime);

            let oModel = new sap.ui.model.json.JSONModel([]);
            oView.byId("idTable_OutwardItem").setModel(oModel);
            this.onAddOutwardItem(); //add initial record in the Outward Item table
        },

        onCancelGateEntry: function () {
            let that = this;
            let sPlant = this.getView().byId("idDropdownPlant").getSelectedKey();
            if (!sPlant) {
                MessageToast.show("Select a Plant");
                return;
            }
            if (!this.oFixedSizeDialog) {
                let gateEntryNoInput = new sap.m.Input({
                    maxLength: 20,
                    showValueHelp: true,
                    //valueHelpOnly: true,
                    valueHelpRequest: function (oEvent) {
                        that.GateEntryNoF4Help(oEvent);
                    },
                    liveChange: function (oEvent) {
                        if (isNaN(oEvent.getSource().getValue())) {
                            oEvent.getSource().setValue();
                            MessageToast.show("Enter valid number");
                        }
                    }
                });
                let gateEntryCancelRemark = new sap.m.TextArea({
                    width: '100%',
                    rows: 3,
                    maxLength: 50
                });
                this.oFixedSizeDialog = new sap.m.Dialog({
                    title: "Cancel Gate Entry",
                    contentWidth: "500px",
                    contentHeight: "270px",
                    content:
                        new sap.m.Panel({
                            content: [
                                new sap.m.VBox({
                                    items: [
                                        new sap.m.Label({
                                            text: 'Gate Entry Number',
                                            required: true
                                        }),
                                        gateEntryNoInput,
                                        new sap.m.Label({
                                            text: 'Remark',
                                            required: true
                                        }),
                                        gateEntryCancelRemark
                                    ]
                                })
                            ]
                        }).addStyleClass('sapUiContentPadding', 'sapUiSmallMarginTop'),
                    beginButton: new sap.m.Button({
                        type: ButtonType.Emphasized,
                        text: "Submit",
                        press: function () {
                            let gateEntryNo = gateEntryNoInput.getValue();
                            let gateEntryIdCancelRemark = gateEntryCancelRemark.getValue();
                            if (gateEntryNo === "" || gateEntryIdCancelRemark === "") {
                                MessageToast.show('Enter the Gate Entry Number & Remark');
                                return;
                            }
                            let payload = {
                                Status: '05',
                                Remarks: gateEntryIdCancelRemark
                            };
                            that.getView().setBusy(true);
                            this.ZB_OUT_GATE_Model.update(`/OutwardGateHeader('${gateEntryNo}')`, payload, {
                                //method: "PUT",
                                success: function (oData, oResponse) {
                                    that.getView().setBusy(false);
                                    MessageBox.success(`Gate Entry Number ${gateEntryNo} has been cancelled`);
                                },
                                error: function (e) {
                                    that.getView().setBusy(false);
                                    if (e.responseText && (e.statusCode === 400 || e.statusCode === "400")) {
                                        var err = JSON.parse(e.responseText);
                                        var msg = err.error.message.value;
                                    } else if (e.responseText && (e.statusCode === 500 || e.statusCode === "500")) {
                                        var parser = new DOMParser();
                                        var xmlDoc = parser.parseFromString(e.responseText, "text/xml");
                                        var msg = xmlDoc.documentElement.childNodes[1].innerHTML;
                                    } else {
                                        var msg = e.message;
                                    }
                                    var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
                                    MessageBox.error(
                                        msg, {
                                        styleClass: bCompact ? "sapUiSizeCompact" : ""
                                    }
                                    );
                                }
                            });

                            gateEntryNoInput.setValue();
                            gateEntryCancelRemark.setValue();
                            that.oFixedSizeDialog.close();
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        //type: ButtonType.Emphasized,
                        text: "Close",
                        press: function () {
                            gateEntryNoInput.setValue();
                            gateEntryCancelRemark.setValue();
                            this.oFixedSizeDialog.close();
                        }.bind(this)
                    })
                });

                //to get access to the controller's model
                this.getView().addDependent(this.oFixedSizeDialog);
            }
            this.oFixedSizeDialog.open();

            that.aGateEntryNum = [];
            let sParameters = {
                "$top": 500
            };
            let filter = new sap.ui.model.Filter({
                path: "Plant",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: sPlant
            });
            this.ZB_OUT_GATE_Model.read("/OutwardGateHeader", {
                filters: [filter],
                urlParameters: sParameters,
                success: function (oResponse) {
                    that.aGateEntryNum = oResponse.results.sort((a, b) => {
                        return b.GateEntryId - a.GateEntryId;
                    });
                },
                error: function (oError) {
                    MessageBox.error("Failed to load gate entry number list");
                }
            });
        },

        GateEntryNoF4Help: function (oEvent) {
            try {
                let that = this;
                let selectedInput = oEvent.getSource();
                let oCustomListItem = new sap.m.StandardListItem({
                    active: true,
                    title: "{GateEntryId}"
                });

                let oSelectDialog = new sap.m.SelectDialog({
                    title: "Select Gate Entry ID",
                    noDataText: "No Data",
                    width: "50%",
                    growing: true,
                    growingThreshold: 12,
                    growingScrollToLoad: true,
                    confirm: function (oEvent) {
                        let aContexts = oEvent.getParameter("selectedContexts");
                        if (aContexts.length) {
                            let selectedValue = aContexts.map(function (oContext) {
                                return oContext.getObject();
                            });
                            selectedInput.setValue(selectedValue[0].GateEntryId);
                        }
                    },
                    liveChange: function (oEvent) {
                        let sValue = oEvent.getParameter("value");
                        let custFilter = new sap.ui.model.Filter("GateEntryId", sap.ui.model.FilterOperator.Contains, sValue);
                        let oBinding = oEvent.getSource().getBinding("items");
                        oBinding.filter(custFilter);
                    }
                });
                let oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
                    modelData: that.aGateEntryNum
                });
                oSelectDialog.setModel(oModel);
                oSelectDialog.bindAggregation("items", "/modelData", oCustomListItem);
                oSelectDialog.open();
            } catch (e) {
                console.log(e);
            }
        }

    });
});