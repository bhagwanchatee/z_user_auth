sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/model/Sorter"
], function (MessageToast, Sorter) {
    'use strict';

    return {
        onPress: function (oEvent) {
            MessageToast.show("Custom handler invoked.");
        },

        onAfterRendering: function () {
            //alert("test");
            debugger
            var oTable = this.getView().byId(
                "zpurreg2::sap.suite.ui.generic.template.ListReport.view.ListReport::ZMM_PURCHASE_REGISTER_FINAL--responsiveTable"
            );
            if (!oTable) {
                return;
            }
           // oTable.attachRowsUpdated(this._removeDuplicates1.bind(this));

        oTable.attachUpdateFinished(this._removeDuplicates.bind(this));
            //zpurreg2::sap.suite.ui.generic.template.ListReport.view.ListReport::ZMM_PURCHASE_REGISTER_FINAL--responsiveTable
        },
        _removeDuplicates1: function () {
            var oTable = this.getView().byId("zpurreg2::sap.suite.ui.generic.template.ListReport.view.ListReport::ZMM_PURCHASE_REGISTER_FINAL--GridTable");

            var oRowBinding = oTable.getBinding("rows");

            if (!oRowBinding) {
                return;
            }

            var aData = oRowBinding.getModel().getProperty(oRowBinding.getPath());
            var seen = {};
            var aUniqueData = [];

            aData.forEach(function (oItem) {
                if (!seen[oItem.ID]) {
                    seen[oItem.ID] = true;
                    aUniqueData.push(oItem);
                }
            });

            // Create JSON model with unique data
            var oUniqueModel = new sap.ui.model.json.JSONModel(aUniqueData);
            oTable.setModel(oUniqueModel);
            oTable.bindRows("/");

        },

        _removeDuplicates: function () {
            var oTable = this.getView().byId("zpurreg2::sap.suite.ui.generic.template.ListReport.view.ListReport::ZMM_PURCHASE_REGISTER_FINAL--responsiveTable");
            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                var aContexts = oBinding.getCurrentContexts();
                var seen = {};
                var aUniqueContexts = aContexts.filter(ctx => {
                    var obj = ctx.getObject();
                    if (seen[obj.ID]) {
                        return false;
                    }
                    seen[obj.ID] = true;
                    return true;
                });

                // Manually remove duplicates from aggregation
                oTable.removeAllItems();
                aUniqueContexts.forEach(ctx => {
                    oTable.addItem(oTable.getBindingInfo("items").template.clone().setBindingContext(ctx));
                });
            }

        },

        _hideDuplicateRows1: function () {
            var oTable = this.getView().byId(
                "zpurreg2::sap.suite.ui.generic.template.ListReport.view.ListReport::ZMM_PURCHASE_REGISTER_FINAL--analyticalTable"
            );

            var oBinding = oTable.getBinding("rows");
            if (!oBinding) {
                return;
            }

            var aContexts = oBinding.getContexts(0, oBinding.getLength());
            if (!aContexts || !aContexts.length) {
                return;
            }

            var mSeen = {};

            aContexts.forEach(function (oCtx, iRow) {
                var oObj = oCtx.getObject();

                // stable stringify (50+ fields safe)
                var sKey = JSON.stringify(
                    Object.keys(oObj).sort().reduce(function (r, k) {
                        r[k] = oObj[k];
                        return r;
                    }, {})
                );

                if (mSeen[sKey]) {
                    // hide duplicate row
                    oTable.addRowSelectionInterval(iRow, iRow); // select first
                    oTable.removeRowSelectionInterval(iRow, iRow);
                    oTable.getRows()[iRow]?.addStyleClass("sapUiInvisibleText");
                } else {
                    mSeen[sKey] = true;
                }
            });
        },

        _hideDuplicateRowsww: function () {
            var oTable = this.getView().byId(
                "zpurreg2::sap.suite.ui.generic.template.ListReport.view.ListReport::ZMM_PURCHASE_REGISTER_FINAL--analyticalTable"
            );

            if (!oTable) {
                return;
            }

            var oBinding = oTable.getBinding("rows");
            if (!oBinding) {
                return;
            }

            oBinding.attachDataReceived(function () {
                var aContexts = oBinding.getContexts();
                if (!aContexts || !aContexts.length) {
                    return;
                }

                var mSeen = {};
                var aUnique = [];

                aContexts.forEach(function (oCtx) {
                    var oObj = oCtx.getObject();

                    // stable stringify (order-safe)
                    var sKey = JSON.stringify(
                        Object.keys(oObj).sort().reduce(function (r, k) {
                            r[k] = oObj[k];
                            return r;
                        }, {})
                    );

                    if (!mSeen[sKey]) {
                        mSeen[sKey] = true;
                        aUnique.push(oObj);
                    }
                });

                // Rebind using JSONModel
                var oJSONModel = new sap.ui.model.json.JSONModel(aUnique);
                oTable.setModel(oJSONModel);

                oTable.bindItems({
                    path: "/",
                    template: oTable.getItems()[0].clone()
                });
            });
        }

    }
});
