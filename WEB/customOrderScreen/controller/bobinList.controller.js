sap.ui.define(
    [
        "sap/m/MessageToast",
        "sap/ui/core/mvc/Controller",
        "customOrderScreen/scripts/transactionCaller",
        "sap/ui/table/RowSettings",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/Dialog",
        "sap/m/Text",
        "sap/m/TextArea",
        "sap/m/Button",
        "sap/m/DialogType",
        "sap/m/ButtonType",
        "sap/ui/core/BusyIndicator"
    ],
    function (
        MessageToast,
        Controller,
        TransactionCaller,
        RowSettings,
        JSONModel,
        MessageBox,
        Filter,
        FilterOperator,
        Dialog,
        Text,
        TextArea,
        Button,
        DialogType,
        ButtonType,
        BusyIndicator
    ) {
        "use strict";
        var oRouter, selectedParentSfc, selectedWorkCenter, selectedOrderStatu, selectedPlant, SITE;

        return Controller.extend("customOrderScreen.controller.tamponLoadScreen", {
            onInit: function () {
                oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("RouteMain3").attachPatternMatched(this._onRoute, this);
                this._urlParams = [
                    "ACTIVITY_ID",
                    "FORM_ID",
                    "LOGON",
                    "OPERATION",
                    "POD_REQUEST",
                    "RESOURCE",
                    "SFC",
                    "SITE",
                    "WORKSTATION",
                    "WPMF_LEGACY_PLUGIN",
                ];
            },

            _onRoute: function (oEvent) {
                selectedParentSfc = oEvent.getParameter("arguments").PARENTSFC;
                selectedWorkCenter = oEvent.getParameter("arguments").WorkCenter;
                selectedOrderStatu = oEvent.getParameter("arguments").MILINDICATOR;
                selectedPlant = oEvent.getParameter("arguments").PLANT;
                SITE = selectedPlant;
                this.buttonVisibility();
                this.getInitialDatas();
            },


            buttonVisibility: function () {

                if (selectedOrderStatu == "X") {
                    this.getView().byId("idEditButton").setVisible(false);
                    this.getView().byId("idDeleteButton").setVisible(false);
                }
            },

            getInitialDatas: function () {
                var dateFilter = "",
                    timeFilter = "";
                if (this.getView().byId("INP7").getDateValue() != null) {
                    dateFilter = this.getView().byId("INP7").getDateValue().toLocaleDateString();
                }

                if (this.getView().byId("INP8").getSelectedKey() != "") {
                    if (this.getView().byId("INP7").getDateValue() == null) {
                        MessageToast.show("Lütfen geçerli bir tarih girişi yapınız");
                        return;
                    } else {
                        timeFilter = this.getView().byId("INP8").getSelectedKey();
                    }
                }

                TransactionCaller.async("ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/BOBIN_LIST/T_GetInventoryListFromSfc", {
                    I_PARENT_SFC: selectedParentSfc,
                    I_FILTER1: this.getView().byId("INP1").getValue(),
                    I_FILTER2: this.getView().byId("INP2").getValue(),
                    I_FILTER3: this.getView().byId("INP3").getValue(),
                    I_FILTER4: this.getView().byId("INP4").getValue(),
                    I_FILTER5: this.getView().byId("INP5").getValue(),
                    I_FILTER6: this.getView().byId("INP6").getValue(),
                    I_FILTER7: dateFilter,
                    I_FILTER8: timeFilter,
                    I_FILTER9: this.getView().byId("INP9").getSelectedKey(),
                    I_SITE: SITE
                },
                    "O_JSON",
                    this.getInitialDatasCB,
                    this,
                    "GET"
                );
            },

            getInitialDatasCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0]?.Rowsets?.Rowset?.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0]?.Rowsets?.Rowset?.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                iv_scope.getView().byId("idInventoryListTable").setModel(myModel);
                iv_scope.getView().byId("idInventoryListTable").getModel().refresh();

                var subTotal1 = 0,
                    subTotal2 = 0,
                    subTotal3 = 0,
                    subTotal4 = 0,
                    subTotal5 = 0,
                    subTotal6 = 0;
                for (var i = 0; i < myModel.getData()?.Rowsets?.Rowset?.Row?.length; i++) {
                    subTotal1 = subTotal1 + Number(myModel.getData().Rowsets.Rowset.Row[i].ORIGINAL_QTY);
                    subTotal2 = subTotal2 + Number(myModel.getData().Rowsets.Rowset.Row[i].QTY_ON_HAND);
                    subTotal3 = subTotal3 + Number(myModel.getData().Rowsets.Rowset.Row[i].TOTALDEFECT);
                    subTotal4 = subTotal4 + Number(myModel.getData().Rowsets.Rowset.Row[i].NC_GROUP001);
                    subTotal5 = subTotal5 + Number(myModel.getData().Rowsets.Rowset.Row[i].NC_GROUP002);
                    subTotal6 = subTotal6 + Number(myModel.getData().Rowsets.Rowset.Row[i].NC_GROUP003);
                }

                iv_scope.getView().byId("subTotal1").setText("Toplam Orijinal Miktar : " + subTotal1);
                //	iv_scope.getView().byId("subTotal2").setText("Toplam Kalan Miktar : " + subTotal2);
                iv_scope.getView().byId("subTotal3").setText("Toplam Deşe : " + subTotal3);
                iv_scope.getView().byId("subTotal4").setText("Toplam Kalite Deşesi : " + subTotal4);
                iv_scope.getView().byId("subTotal5").setText("Toplam Diğer Deşe : " + subTotal5);
                iv_scope.getView().byId("subTotal6").setText("Toplam Trim Deşesi : " + subTotal6);
            },

            handleRefresh: function (oEvent) {
                this.getInitialDatas();
            },

            onOverflowToolbarPress: function () {
                var oPanel = this.byId("expandablePanel");
                oPanel.setExpanded(!oPanel.getExpanded());
            },

            onPressCleanFilter: function () {
                this.getView().byId("INP1").setValue("");
                this.getView().byId("INP2").setValue("");
                this.getView().byId("INP3").setValue("");
                this.getView().byId("INP4").setValue("");
                this.getView().byId("INP5").setValue("");
                this.getView().byId("INP6").setValue("");
                this.getView().byId("INP7").setValue(null);
                this.getView().byId("INP8").setSelectedKey("");
                this.getView().byId("INP9").setSelectedKey("");
                this.getInitialDatas();
            },
            onPressDeleteConfirmation: function () {

                this.selectedContextPath = this.getView()
                    .byId("idInventoryListTable")
                    .getSelectedContextPaths("rows");
                this.selectedLine = this.getView()
                    .byId("idInventoryListTable")
                    .getModel()
                    .getObject(this.selectedContextPath[0]);

                if (this.selectedLine == null || this.selectedLine == "") {
                    MessageBox.error("Lütfen tablodan saçır seçiniz!");
                    return;
                }

                this.selectedBobinID = this.selectedLine.SFC;
                this.selectedShopOrder = this.selectedLine.SHOP_ORDER;

                if (!this.oApproveDialog) {
                    this.oApproveDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Confirm",
                        content: new Text({
                            id: "dialogTextID",
                            text: this.selectedBobinID + " bobin ve ilişkili bobin grubu için teyit iptali yapmak istediğinize emin misiniz?"
                        }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Submit",
                            press: function () {

                                this.cancelConfirmation(this.selectedBobinID, this.selectedShopOrder);

                                this.oApproveDialog.close();
                            }.bind(this),
                        }),
                        endButton: new Button({
                            text: "Cancel",
                            press: function () {
                                this.oApproveDialog.close();
                            }.bind(this),
                        }),
                    });
                }

                this.oApproveDialog.open();
                sap.ui.getCore().byId("dialogTextID").setText(this.selectedBobinID +
                    " bobin ve ilişkili bobin grubu için teyit iptali yapmak istediğinize emin misiniz?");

            },

            cancelConfirmation: function (selectedBobinID, selectedShopOrder) {
                this.showBusyIndicator(5000, 0);

                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/combineConfEditCancel/mainTransaction/T_MainTransactionCombineOrderCancelEdit", {
                    I_INV: selectedBobinID,
                    I_SHOP_ORDER: selectedShopOrder,

                },
                    "O_JSON",
                    this.cancelConfirmationCB,
                    this,
                    "GET"
                );

            },

            cancelConfirmationCB: function (iv_data, iv_scope) {
                if (iv_data[1] == "E") {
                    MessageBox.show(iv_data[0]);
                    return;
                } else {
                    MessageBox.show(iv_data[0]);
                    iv_scope.getInitialDatas();

                }

            },
            onPressSearchFilter: function () {
                this.getInitialDatas();
            },

            navBack: function () {
                oRouter.navTo("RouteMain", {})
            },

            onPressQualityResults: function (oEvent) {
                var selectedContextPath = this.getView()
                    .byId("idInventoryListTable")
                    .getSelectedContextPaths("rows");
                var selectedLine = this.getView()
                    .byId("idInventoryListTable")
                    .getModel()
                    .getObject(selectedContextPath[0]);

                if (selectedLine == null || selectedLine == "") {
                    MessageBox.error("Lütfen tablodan saçır seçiniz!");
                } else {

                    var response = TransactionCaller.sync("ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/GET_OPERATION/T_GET_OPERATION_NUMBER", {
                        I_BATCH: selectedLine.SFC,
                    },
                        "O_JSON"
                    );

                    var operationNo = response[0]?.Rowsets?.Rowset?.Row?.REPORTING_STEP;

                    if (operationNo == null || operationNo == "") {
                        MessageBox.error("Sistemde operasyon numrası bulunamadı");
                    } else {
                        oRouter.navTo("RouteMain4", {
                            batchNo: selectedLine.SFC,
                            operationNo: operationNo,
                            selectedParentSfc: selectedParentSfc,
                            selectedWorkCenter: selectedWorkCenter,
                            selectedOrderStatu: selectedOrderStatu,
                            PLANT: selectedLine.SITE
                        });
                    }
                }
            },
            showBusyIndicator: function (iDuration, iDelay) {
                BusyIndicator.show(iDelay);

                if (iDuration && iDuration > 0) {
                    if (this._sTimeoutId) {
                        clearTimeout(this._sTimeoutId);
                        this._sTimeoutId = null;
                    }

                    this._sTimeoutId = setTimeout(function () {
                        this.hideBusyIndicator();
                    }.bind(this), iDuration);
                }
            },

            hideBusyIndicator: function () {
                BusyIndicator.hide();
            },

            onPressBobbinStatusChange: function () {
                var selectedContextPath = this.getView()
                    .byId("idInventoryListTable")
                    .getSelectedContextPaths("rows");
                var selectedLine = this.getView()
                    .byId("idInventoryListTable")
                    .getModel()
                    .getObject(selectedContextPath[0]);



                if (selectedLine == null || selectedLine == "") {
                    MessageBox.error("Lütfen tablodan saçır seçiniz!");
                    return;
                } else {
                    var selectedBobinID = selectedLine.SFC;
                    var selectedBobinMaterial = selectedLine.MATERIAL;
                    var selectedBobinStrogeLoc = selectedLine.STORAGE_LOCATION;
                    var selectedRowQty = selectedLine.ORIGINAL_QTY;

                    // if (!this.dialog) {
                    //     this.dialog = new Dialog({
                    //         type: DialogType.Message,
                    //         title: "Confirm",
                    //         content: new Text({ id:"dialogTextID", text: selectedBobinID + " bobini kontrollü kullanıma ayırmak istediğinize emin misiniz?" }),
                    //         beginButton: new Button({
                    //             type: ButtonType.Emphasized,
                    //             text: "Submit",
                    //             press: function () {

                    // 				this.onPressBobbinStatusChangeOK(selectedBobinID);

                    //                 this.dialog.close();
                    //             }.bind(this),
                    //         }),
                    //         endButton: new Button({
                    //             text: "Cancel",
                    //             press: function () {
                    //                 this.dialog.close();
                    //             }.bind(this),
                    //         }),
                    //     });
                    // }

                    jQuery.sap.require("sap.m.MessageBox");

                    sap.m.MessageBox.show(
                        selectedBobinID + " No'lu bobin kontrollü kullanıma ayrılacaktır.Onaylıyor musunuz?", {
                        icon: sap.m.MessageBox.Icon.WARNING,
                        title: "UYARI",
                        actions: [
                            sap.m.MessageBox.Action.OK,
                            sap.m.MessageBox.Action.CANCEL,
                        ],
                        onClose: function (oAction) {
                            if (oAction == "OK") {

                                this.onPressBobbinStatusChangeOK(selectedBobinID, selectedBobinMaterial, selectedBobinStrogeLoc, selectedRowQty);

                            }
                        }.bind(this),
                    }
                    );
                }

            },

            onPressBobbinStatusChangeOK: function (selectedBobinID, selectedBobinMaterial, selectedBobinStrogeLoc, selectedRowQty) {

                TransactionCaller.async("ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/MIL_BOBIN/bobbinStatusChange/T_InventoryDataSaveWithParameter", {
                    I_INV: selectedBobinID,
                    I_Plant: selectedPlant,
                    I_MATNR: selectedBobinMaterial,
                    I_STRLOC: selectedBobinStrogeLoc,
                    I_QTY: selectedRowQty

                },
                    "O_JSON",
                    this.onPressBobbinStatusChangeOKCB,
                    this,
                    "GET"
                );

            },

            onPressBobbinStatusChangeOKCB: function (iv_data, iv_scope) {
                if (iv_data[1] == "E") {
                    MessageToast.show(iv_data[0]);
                    return;
                } else {
                    MessageToast.show(iv_data[0]);
                    //iv_scope.onPressAddDecision();

                }
            },

            onPressAddDecision: function (oEvent) {

                // var baseURL = "/XMII/CM/ECZ_MES-4.0/usageDecisionScreenKUM/index.html?";

                // this._urlParams.forEach((item) => {
                // 	var val = jQuery.sap.getUriParameters().get(item);
                // 	if (!!val) {
                // 		baseURL += "&" + item + "=" + val;
                // 	}
                // }, this);
                // debugger;

                // window.open(baseURL, "usageDecision", "width=1000px,height=1500px");

                oRouter.navTo("RouteMain5", {
                    PLANT: selectedPlant
                });

            },

            onPressEditDecision: function () {

                var bobinNo = this.getView().byId("idInventoryListTable").getSelectedItem()?.getBindingContext().getProperty("SFC");

                var orginalQty = this.getView().byId("idInventoryListTable").getSelectedItem()?.getBindingContext().getProperty("ORIGINAL_QTY");

                if (!this._oDialogBobinEdit) {
                    this._oDialogBobinEdit = sap.ui.xmlfragment(
                        "Z_BobinEdit",
                        "customOrderScreen.view.fragments.bobinEdit",

                        this
                    );

                    this.getView().addDependent(this._oDialogBobinEdit);
                }

                sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "bobinIdField"
                ).setText(bobinNo);

                sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "quantityFieldOld"
                ).setValue(orginalQty);
                this._oDialogBobinEdit.open();

                this.getBobinDetailsForEdit(bobinNo);
            },

            getBobinDetailsForEdit: function (bobinId) {

                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/combineConfEditCancel/getBobinDetailsForEdit/T_GetBobinDetailsForEdit", {
                    I_BOBIN_ID: bobinId,

                },
                    "O_JSON",
                    this.getBobinDetailsForEditCB,
                    this,
                    "GET"
                );

            },

            getBobinDetailsForEditCB: function (iv_data, iv_scope) {
                if (iv_data[1] == "E") {
                    MessageBox.show(iv_data[0]);
                    return;
                } else {

                    sap.ui.core.Fragment.byId(
                        "Z_BobinEdit",
                        "oldScraptFieldId"
                    ).setText(iv_data[0].Result.result1.Row?.DESCRIPTION);
                    sap.ui.core.Fragment.byId(
                        "Z_BobinEdit",
                        "oldScraptFieldIdKey"
                    ).setValue(iv_data[0].Result.result1.Row?.NC_CODE);
                    sap.ui.core.Fragment.byId(
                        "Z_BobinEdit",
                        "oldScraptQuantityId"
                    ).setText(iv_data[0].Result.result1.Row?.QTY);

                    var myModel = new sap.ui.model.json.JSONModel();
                    myModel.setData(iv_data[0].Result.result2.Result.items?.item);
                    sap.ui.core.Fragment.byId(
                        "Z_BobinEdit",
                        "newScraptFieldId"
                    ).setModel(myModel);
                }

            },

            liveChangeScraptInput: function () {

                var oldBobinQty = sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "quantityFieldOld"
                ).getValue();

                var oldScraptQty = sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "oldScraptQuantityId"
                ).getText();

                // var newBobinQty = sap.ui.core.Fragment.byId(
                // 	"Z_BobinEdit",
                // 	"quantityFieldNew"
                // ).getValue();

                var newScraptQty = sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "newScraptQuantityId"
                ).getValue();

                // if (oldBobinQty + oldScraptQty != newBobinQty + newScraptQty) {

                // 	MessageBox.show(oldBobinQty + oldScraptQty + "kg toplam miktar olacak şekilde deşe ve bobin miktarı girişi yapınız!");
                // 	return;
                // }

                sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "quantityFieldNew"
                ).setValue(Number(oldBobinQty) + Number(oldScraptQty) - Number(newScraptQty));

            },

            onPresStockChangeSaveButton: function () {


                var bobinNo = sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "bobinIdField"
                ).getText();
                var oldQty = sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "quantityFieldOld"
                ).getValue();
                var newQty = sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "quantityFieldNew"
                ).getValue();

                var newScraptQty = sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "newScraptQuantityId"
                ).getValue();
                var oldScraptQty = sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "oldScraptQuantityId"
                ).getText();

                if (oldScraptQty == "") {
                    oldScraptQty = 0;
                }

                var newScraptKeyField = sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "newScraptFieldId"
                ).getSelectedKey();

                var plant = this.getView().byId("idInventoryListTable").getSelectedItem()?.getBindingContext().getProperty("SITE");

                jQuery.sap.require("sap.m.MessageBox");

                sap.m.MessageBox.show(
                    bobinNo + " No'lu bobin miktarı değiştirilecektir.Onaylıyor musunuz?", {
                    icon: sap.m.MessageBox.Icon.WARNING,
                    title: "UYARI",
                    actions: [
                        sap.m.MessageBox.Action.OK,
                        sap.m.MessageBox.Action.CANCEL,
                    ],
                    onClose: function (oAction) {
                        if (oAction == "OK") {
                            this.changeBobinQuantity(bobinNo, oldQty, newQty, plant, newScraptKeyField, newScraptQty, oldScraptQty);
                            //this.checkDataBeforeSendData();
                        }
                    }.bind(this),
                }
                );

            },

            changeBobinQuantity: function (bobinNo, oldQty, newQty, plant, newScraptKeyField, newScraptQty, oldScraptQty) {

                TransactionCaller.async("ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/combineOrderManuelEdit_101_102/T_MainTransactionInv101_102", {
                    I_ENTRY_QNT_NEW: newQty,
                    I_ENTRY_QNT_OLD: oldQty,
                    I_INV: bobinNo,
                    I_SITE: plant,
                    I_WC: selectedWorkCenter,
                    I_SCRAPT_TYPE: newScraptKeyField,
                    I_531_NEW: newScraptQty,
                    I_531_OLD: oldScraptQty

                },
                    "O_JSON",
                    this.changeBobinQuantityCB,
                    this,
                    "GET"
                );

            },

            changeBobinQuantityCB: function (iv_data, iv_scope) {
                iv_scope._oDialogBobinEdit.close();
                MessageToast.show(iv_data[0]);

                sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "bobinIdField"
                ).setText();

                sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "quantityFieldOld"
                ).setValue();
                sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "quantityFieldNew"
                ).setValue();

                iv_scope.getInitialDatas();
            },

            onFragmentCancel: function () {
                this._oDialogBobinEdit.close();
                sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "newScraptQuantityId"
                ).setValue();
                sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "newScraptFieldId"
                ).setSelectedKey();
                sap.ui.core.Fragment.byId(
                    "Z_BobinEdit",
                    "quantityFieldNew"
                ).setValue();
                

            }


        });
    }
);