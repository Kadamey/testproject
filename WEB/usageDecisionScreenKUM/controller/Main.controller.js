sap.ui.define(
    [
        "jquery.sap.global",
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/export/library",
        "sap/ui/export/Spreadsheet",
        "usageDecisionScreenKUM/scripts/transactionCaller",
    ],
    function (
        jQuery,
        Controller,
        JSONModel,
        MessageToast,
        MessageBox,
        Fragment,
        Filter,
        FilterOperator,
        exportLibrary,
        Spreadsheet,
        TransactionCaller
    ) {
        "use strict";
        var that,
            sPath,
            myModel,
            dummyModel,
            labelData,
            tableModel,
            SFC,
            SITE,
            selectedLine,
            ncQtyData,
            ncQtyModel,
            selectedModel;
        var transferMaterialCodeStatu;
        var scrapStatu;
        var iDecision;
        var oldMaterial;
        var newMaterial;
        var ncCode;
        var ncCost;
        var ncQty;
        var plant;
        var usageDecision;
        var inventoryID;
        var qtyRcpt;

        return Controller.extend("usageDecisionScreenKUM.controller.Main", {
            onInit: function () {
                // debugger;
                SFC = "T732";
                // SFC = jQuery.sap.getUriParameters().get("SFC");
                // this.setDummyData();
                // this.getUsageDecisionLabel();
                SITE=jQuery.sap.getUriParameters().get("SITE");
                this.getQuarantineBobinData();
                // ncQtyData = {
                // 	ncQtyData: [{"input2":0}],
                // };
                ncQtyModel = new sap.ui.model.json.JSONModel({
                    input2: 0,
                });
                //ncQtyModel.setData(ncQtyData);

                this.getView().setModel(ncQtyModel, "ncQtyModel");

                // SFC = jQuery.sap.getUriParameters().get("SFC");

            },

            onChangeMat: function () {

                var selectedMatChange = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idCombobox1"
                ).getSelected();



                if (selectedMatChange == false) {
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNewMaterial"
                    ).setEditable(false);


                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNewMaterial"
                    ).setSelectedKey("");

                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNewMaterialDesc"
                    ).setValue("");
                }
                else {
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNewMaterial"
                    ).setEditable(true);
                }



            },


            onChangeDese: function () {
                var selectedCheckBox2 = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idCombobox2"
                ).getSelected();

                if (selectedCheckBox2 == false) {

                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCode"
                    ).setEditable(false);

                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcQty"
                    ).setEditable(false);

                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCost"
                    ).setEditable(false);


                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idDecDesc"
                    ).setEditable(false);

                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCode"
                    ).setSelectedKey("");

                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcQty"
                    ).setValue("");

                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idQtyRcpt"
                    ).setValue("");

                }
                else {

                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCode"
                    ).setEditable(true);

                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcQty"
                    ).setEditable(true);

                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCost"
                    ).setEditable(true);

                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idDecDesc"
                    ).setEditable(true);

                }
            },



            onSelectFromTable: function () {
                var selectedContextPath = this.getView()
                    .byId("idUsageDeciTable")
                    .getSelectedContextPaths("rows");
                selectedLine = this.getView()
                    .byId("idUsageDeciTable")
                    .getModel()
                    .getObject(selectedContextPath[0]);
                selectedModel = new sap.ui.model.json.JSONModel({
                    selectedLine,
                });

                this.getView().setModel(selectedModel, "selectedModel");

            },

            getQuarantineBobinData: function () {
                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/usageDesicion_RFC/setQuarantineBobin",
                    {I_PLANT:SITE},
                    "O_JSON",
                    this.getQuarantineBobinDataCB,
                    this,
                    "GET",
                    {}
                );
            },
            getQuarantineBobinDataCB: function (iv_data, iv_scope) {
                tableModel = new sap.ui.model.json.JSONModel();

                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    tableModel.setData(iv_data[0]);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    tableModel.setData(obj_iv_data);
                }
                //myModel.refresh();
                iv_scope.getView().byId("idUsageDeciTable").setModel(tableModel);
            },
            getBobinMaterialsData: function () {
                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/usageDesicion_RFC/setBobinMaterials",
                    {},
                    "O_JSON",
                    this.getBobinMaterialsDataCB,
                    this,
                    "GET",
                    {}
                );
            },
            getBobinMaterialsDataCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();

                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }
                //myModel.refresh();

                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idNewMaterial"
                ).setModel(myModel);

                // iv_scope.getView().byId("idUsageDeciTable").setModel(tableModel);
            },


            getNCCodeData: function () {
				var plant=selectedLine.SITE;
                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/usageDesicion_RFC/setNCCodes",
                    {
						I_Plant:plant
					},
                    "O_JSON",
                    this.getNCCodeDataCB,
                    this,
                    "GET",
                    {}
                );
            },

            getNCCodeDataCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();

                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }
                //myModel.refresh();

                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idNcCode"
                ).setModel(myModel);

                // iv_scope.getView().byId("idUsageDeciTable").setModel(tableModel);
            },

            // getDataFieldsParams: function () {
            //     TransactionCaller.async(
            //         "ECZ_MES-4.0/KAGIT/usageDesicion_RFC/setDataFieldParams",
            //         {},
            //         "O_JSON",
            //         this.getDataFieldsParamsCB,
            //         this,
            //         "GET",
            //         {}
            //     );
            // },

            // getDataFieldsParamsCB: function (iv_data, iv_scope) {
            //     var myModel = new sap.ui.model.json.JSONModel();

            //     if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
            //         myModel.setData(iv_data[0]);
            //     } else {
            //         var obj_iv_data = iv_data[0];
            //         var dummyData = [];
            //         dummyData.push(iv_data[0].Rowsets.Rowset.Row);
            //         obj_iv_data.Rowsets.Rowset.Row = dummyData;
            //         myModel.setData(obj_iv_data);
            //     }
            //     //myModel.refresh();

            //     sap.ui.core.Fragment.byId(
            //         "usageDecisionScreen_Add",
            //         "idUsage"
            //     ).setModel(myModel);
            // },

            getCostCenterDatas: function () {
                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/usageDesicion_RFC/setCostCentersKUM",
                    {},
                    "O_JSON",
                    this.getCostCenterDatasCB,
                    this,
                    "GET",
                    {}
                );
            },

            getCostCenterDatasCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();

                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }
                //myModel.refresh();

                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idNcCost"
                ).setModel(myModel);
            },

            // Add fragment fonksiyonu-MOKTAY
            getDialog1: function () {
                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment(
                        "usageDecisionScreen_Add",
                        "usageDecisionScreenKUM.view.fragments.usageDecisionScreen_Add",
                        this
                    );
                    this.getView().addDependent(this._oDialog);
                }
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idQuantity"
                ).setValue("");

                return this._oDialog;
            },

            onMaterialChange: function () {
                var selectedKey = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idNewMaterial"
                ).getSelectedKey();
                var materialData = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idNewMaterial"
                )
                    .getModel()
                    .getData().Rowsets.Rowset.Row;

                for (var i = 0; i < materialData.length; i++) {
                    if (materialData[i].ITEM == selectedKey) {
                        sap.ui.core.Fragment.byId(
                            "usageDecisionScreen_Add",
                            "idNewMaterialDesc"
                        ).setValue(materialData[i].DESCRIPTION);
                    }
                }

            },

            onNcQtyEnter: function () {
                var enteredValue = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idNcQty"
                ).getValue();

                ncQtyModel.getData().input2 = enteredValue;
                ncQtyModel.refresh();
                this.getView().setModel(ncQtyModel, "ncQtyModel");
            },


            onPressDecisionButton:function(){

                var response=TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/userGroupControl/T_ AuthorityControl",
                    {
                        I_SITE:SITE
                    },
                    "O_JSON",
                    this.onPressDecisionButtonCB,
                    this,
                    "GET"
                );




            },

            onPressDecisionButtonCB(iv_data,iv_scope){

            if(iv_data[1]==="S"){

                iv_scope.onPressAddDecision();

            } else{
                MessageToast.show(iv_data[0]);
            }},


            onPressAddDecision: function () {
                if (!selectedLine) {
                    MessageToast.show("Tablodan satır seçiniz.");
                    return;
                }
                this.getDialog1().open();
                this.getBobinMaterialsData();
                this.getNCCodeData();
               // this.getDataFieldsParams();
                this.getCostCenterDatas();

                plant = selectedLine.SITE;

                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idMaterial"
                ).setValue(selectedLine.ITEM);
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idMaterialDesc"
                ).setValue(selectedLine.DESCRIPTION);
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idBobin"
                ).setValue(selectedLine.INVENTORY_ID);
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idGdsMvmt"
                ).setValue(selectedLine.QTY_ORDERED);
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idStorage"
                ).setValue(selectedLine.STORAGE);

                //Kalan miktar fragment açıldığında görünmesi-dbilgin
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idQtyRcpt"
                ).setValue(selectedLine.QTY_ON_HAND);

            },



            onFragmentSave: function (oEvent) {

                inventoryID = selectedLine.INVENTORY_ID;

                transferMaterialCodeStatu = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idCombobox1").getSelected();
                if (transferMaterialCodeStatu == true) {
                    transferMaterialCodeStatu = "1";
                } else {
                    transferMaterialCodeStatu = "0";
                }

                scrapStatu = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idCombobox2").getSelected();
                if (scrapStatu == true) {
                    scrapStatu = "1";
                } else {
                    scrapStatu = "0";
                }


                if (scrapStatu == 0 & transferMaterialCodeStatu == 0) {


                    usageDecision = "KABUL";
                    this.confirmUsageDecision();

                }

                else if (scrapStatu == 1 & transferMaterialCodeStatu == 0) {
                    ncCode = sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCode"
                    ).getSelectedKey();

                    ncQty = sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcQty"
                    ).getValue();

                    ncCost = sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCost"
                    ).getSelectedKey();

                    qtyRcpt = sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idQtyRcpt"
                    ).getValue();

                    usageDecision = "SARTLI KABUL";

                    this.confirmUsageDecision();
                    
                }

                else if (scrapStatu == 1 & transferMaterialCodeStatu == 1) {

                    ncCode = sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCode"
                    ).getSelectedKey();


                    ncQty = sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcQty"
                    ).getValue();

                    ncCost = sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCost"
                    ).getSelectedKey();

                    qtyRcpt = sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idQtyRcpt"
                    ).getValue();


                    if (qtyRcpt == "0") {
                        usageDecision = "RED";

                    }

                    else {
                        usageDecision = "SARTLI KABUL";
                    }

                    this.confirmUsageDecision();

                }

                else {

                    usageDecision = "SARTLI KABUL";
                    this.confirmUsageDecision();
                }


            },

            

            confirmUsageDecision: function () {
                jQuery.sap.require("sap.m.MessageBox");

                sap.m.MessageBox.show(
                    inventoryID + " No'lu bobin kullanım kararı " + usageDecision + " olarak QM'e gönderilecektir.Onaylıyor musunuz?",
                    {
                        icon: sap.m.MessageBox.Icon.WARNING,
                        title: "UYARI",
                        actions: [
                            sap.m.MessageBox.Action.OK,
                            sap.m.MessageBox.Action.CANCEL,
                        ],
                        onClose: function (oAction) {
                            if (oAction == "OK") {
                                this.onSaveDecision();
                                if(scrapStatu == 1 & transferMaterialCodeStatu == 1|| scrapStatu == 0 & transferMaterialCodeStatu == 1){
                                    this.saveMaterialTransformation();
                                }else if (scrapStatu == 1 & transferMaterialCodeStatu == 0){
                                    this.saveMaterialScrapValues();
                                }
                            }
                        }.bind(this),
                    }
                );

            },



            saveMaterialScrapValues: function () {

                var material = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idMaterial"
                ).getValue();

                // var iDecision = sap.ui.core.Fragment.byId(
                //     "usageDecisionScreen_Add",
                //     "idUsage"
                // ).getSelectedKey();
                var material = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idMaterial"
                ).getValue();
                var invId = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idBobin"
                ).getValue();


                var storage = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idStorage"
                ).getValue();

                var usageDecision = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idDecDesc"
                ).getValue();

                var scrapStatu="1";
                var matTransferStatu="0";
                if (ncCode == "" || ncCost == "" || usageDecision == "") {
                    var msg = "Lütfen alanları eksiksiz doldurunuz."
                    MessageToast.show(msg);

                }

                else {

                    TransactionCaller.async(
                     //   "ECZ_MES-4.0/KAGIT/usageDesicion_RFC/Queue_Scrap/T_MainTrnsScrap",

                     "ECZ_MES-4.0/KAGIT/usageDesicion_RFC/Queue_343/T_GoodsMovement",
                        {
                            I_BatchNumber: invId,
                            I_MaterialNumber: material,
                            I_Plant: plant,
                            I_Quantity: qtyRcpt,
                            I_MatStrLoc: storage,
                            I_ScrapType: ncCode,
                            I_ScrapCostCenter: ncCost,
                            I_Quantity: qtyRcpt,
                            I_ScrapQty: ncQty,
                            I_ScrapStatu:scrapStatu,
                            I_TransferMatCodeStatu:matTransferStatu

                        },
                        "O_JSON",
                        this.saveMaterialScrapValuesCB,
                        this,
                        "GET"
                    );



                }

            },


            saveMaterialScrapValuesCB: function (iv_data, iv_scope) {

                // if (iv_data[1] != "E") {

                //     MessageToast.show("Deşe girişi başarıyla yapıldı.");


                // } else {
                //     MessageToast.show("Hata");
                // }


                iv_scope.getQuarantineBobinData();


               // iv_scope.getDialog1().close();

            },

            saveMaterialTransformation: function () {

                if (scrapStatu == "1") {
                    // iDecision = sap.ui.core.Fragment.byId(
                    //     "usageDecisionScreen_Add",
                    //     "idUsage"
                    // ).getSelectedKey();

                    var ncCode = sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCode"
                    ).getSelectedKey();

                    var ncCost = sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCost"
                    ).getSelectedKey();

                    var usageDecision = sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idDecDesc"
                    ).getValue();

                }

                oldMaterial = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idMaterial"
                ).getValue();
                var invId = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idBobin"
                ).getValue();
                newMaterial = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idNewMaterial"
                ).getValue();

                var qtyRcpt = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idQtyRcpt"
                ).getValue();

                var storage = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idStorage"
                ).getValue();




                if (scrapStatu == "0" || (scrapStatu == "1" & ncCode != "" & usageDecision != "" & ncCost != "") || (scrapStatu == "1" & ncCode == "" & ncCost == "")) {

                    TransactionCaller.async(
                      //  "ECZ_MES-4.0/KAGIT/usageDesicion_RFC/Queue_309/T_GoodsMovement",
                      "ECZ_MES-4.0/KAGIT/usageDesicion_RFC/Queue_343/T_GoodsMovement",
                        {
                            I_BatchNumber: invId,
                            I_MaterialNumber: oldMaterial,
                            I_MoveMaterial: newMaterial,
                            I_Quantity: qtyRcpt,
                            I_MatStrLoc: storage,
                            I_ScrapStatu: scrapStatu,
                            I_ScrapType: ncCode,
                            I_ScrapQty: ncQty,
                            I_ScrapCostCenter: ncCost,
                            I_Plant:SITE
                        },
                        "O_JSON",
                        this.saveMaterialTransformationCB,
                        this,
                        "GET"
                    );


                    //this.getDialog1().close();
                    //this.getQuarantineBobinData();
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idCombobox1"
                    ).setSelected(false);
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idCombobox2"
                    ).setSelected(false);

                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNewMaterialDesc"
                    ).setValue("");
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCost"
                    ).setValue("");
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idDecDesc"
                    ).setValue("");
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcQty"
                    ).setValue("");
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNewMaterial"
                    ).setSelectedKey("");
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCode"
                    ).setSelectedKey("");
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idQtyRcpt"
                    ).setValue("");

                }


                else if (scrapStatu == "1" & ncCode != "" & usageDecision != "" & ncCost == "") {

                    var msg = "Lütfen deşe miktarını giriniz.";
                    MessageToast.show(msg);

                }

                else {
                 //   this.getDialog1().close();
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNewMaterialDesc"
                    ).setValue("");
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCost"
                    ).setValue("");
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idDecDesc"
                    ).setValue("");
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcQty"
                    ).setValue("");
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNewMaterial"
                    ).setSelectedKey("");
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idNcCode"
                    ).setSelectedKey("");
                    sap.ui.core.Fragment.byId(
                        "usageDecisionScreen_Add",
                        "idQtyRcpt"
                    ).setValue("");

                }

            },

            saveMaterialTransformationCB: function (iv_data, iv_scope) {

                var newMaterial = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idNewMaterial"
                ).getSelectedKey();

                var oldMaterial = sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idMaterial"
                ).getValue();
                // MessageToast.show(iv_data[0]);
                // window.reload();
                if (iv_data[1] != "E") {
                    if (newMaterial != "") {

                        if (newMaterial != oldMaterial) {


                            MessageToast.show("Malzeme Kodu Başarı ile Değiştirildi");
                        }

                    }
                }


                iv_scope.getQuarantineBobinData();
            },

            onFragmentCancel: function () {
                this.getDialog1().close();
                window.location.reload();

                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idCombobox1"
                ).setSelected(false);
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idCombobox2"
                ).setSelected(false);

                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idNewMaterialDesc"
                ).setValue("");
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idNcCost"
                ).setValue("");
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idDecDesc"
                ).setValue("");
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idNcQty"
                ).setValue("");
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idNewMaterial"
                ).setSelectedKey("");
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idNcCode"
                ).setSelectedKey("");
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idQtyRcpt"
                ).setValue("");
                sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idQtyRcpt"
                ).setValue("");

                this.onChangeDese();
                this.onChangeMat();
            },

            onDeleteFromTable: function (oEvent) {
                // var oPath = parseInt(
                // 	oEvent.getParameter("listItem").getBindingContextPath().split("/")[2]
                // );

                tableModel.getData().Rowsets.Rowset.Row.splice(selectedLine, 1);
                tableModel.refresh();
                // tableModel.setData(selectedLine);
                this.getView().byId("idUsageDeciTable").setModel(tableModel);
            },

            onSaveDecision: function () {

                var description=sap.ui.core.Fragment.byId(
                    "usageDecisionScreen_Add",
                    "idDecDesc"
                ).getValue();
                
                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/usageDecision/usageDecision_Queue",
                    {
                        I_bobinID: inventoryID,
                        I_usageDecision: usageDecision,
                        I_Plant: plant,
                        I_Desc:description

                    },
                    "O_JSON",
                    this.onSaveDecisionCB,
                    this,
                    "GET"
                );

            },

            onSaveDecisionCB: function (iv_data, iv_scope) {

                if(iv_data[1]=="S")
                {
                    var msg="İşlem başarı ile kuyruğa düşürülmüştür."
                    MessageToast.show(msg);
               }

                else{
                    var msg=iv_data[0];
                    MessageToast.show(msg);

                }

                iv_scope.getDialog1().close();
                window.location.reload();
            },

            ResourceBundle: function (iv_id) {
                var oBundle = this.getView().getModel("i18n").getResourceBundle();
                var txt = oBundle.getText(iv_id);
                return txt;
            },
        });
    }
);
