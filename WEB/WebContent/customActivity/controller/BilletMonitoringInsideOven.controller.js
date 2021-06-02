sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "customActivity/scripts/transactionCaller",
    "sap/m/MessageToast",
], function (Controller, JSONModel, TransactionCaller, MessageToast) {
    "use strict";

    return Controller.extend("CustomActivity.controller.BilletMonitoringInsideOven.controller", {
        onInit: function () {
            this.bindCardsGrid();
            var oTrigger = new sap.ui.core.IntervalTrigger(30000);
            oTrigger.addListener(() => { this.bindCardsGrid(); }, this);
        },

        bindCardsGrid: function () {
            TransactionCaller.async("ItelliMES/OPERATIONS/STOCK_TRACKING/T_SLC_COUNT_FIRIN_QUANTITY",
                {
                    I_SIGNALPOINT: "FRNG"
                },
                "O_JSON",
                this.bindCardsGridCB,
                this);
        },

        bindCardsGridCB: function (iv_data, iv_scope) {
            var rowData = [];
            if (iv_data[0].Rowsets.Rowset.Row[0] == undefined) {
                rowData.push({
                    "CASTNO": iv_data[0].Rowsets.Rowset.Row.CASTNO,
                    "CLASS1": iv_data[0].Rowsets.Rowset.Row.CLASS1,
                    "COUNT1": iv_data[0].Rowsets.Rowset.Row.COUNT1,
                    "CLASS2": iv_data[0].Rowsets.Rowset.Row.CLASS2,
                    "COUNT2": iv_data[0].Rowsets.Rowset.Row.COUNT2,
                    "COUNT3": iv_data[0].Rowsets.Rowset.Row.COUNT3
                })
            } else {
                iv_data[0].Rowsets.Rowset.Row.forEach((index, input) => { rowData.push(index) });
            }

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({ "cards": rowData });
            iv_scope.getView().setModel(oModel);
        }
    });
});