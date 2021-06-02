sap.ui.define(
    [
        "sap/m/MessageToast",
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/resource/ResourceModel",
        "customActivity/scripts/transactionCaller",
        "sap/m/Switch",
    ],
    function (
        MessageToast,
        Controller,
        JSONModel,
        ResourceModel,
        TransactionCaller,
        Switch
    ) {
        "use strict";

        return Controller.extend("customActivity.controller.manualOrderCreation", {
            groupsByKeys: {
                1: "QUALITY",
                2: "PROFILE",
                3: "LENGTH",
                4: "CASTNUMBER",
                5: "CASTWEIGHT",
                6: "MATCODE",
                7: "ORDERLOCATION",

            },

            pageValues: {
                QUALITY: "",
                PROFILE: "",
                LENGTH: "",
                CASTNUMBER: "",
                CASTWEIGHT: "",
                MATCODE: "",
                ORDERLOCATION: "",
            },

            onInit: function () {
                this.initSelections();
                this.getOrderLocation();
                this.getSDMStorageLocations();
            },

            initSelections: function () {
                this.getQuality();
                this.getProfile();
                this.getLength();
            },

            getQuality: function () {
                this.callCharTrx("Y_KALITE", "steelQuality");
            },

            getProfile: function () {
                this.callCharTrx("Y_KESIT", "section");
            },

            getLength: function () {
                this.callCharTrx("Y_BOY", "size");
            },

            onComboChange: function (oEvent) {
                this.getView().byId("idMaterialCode").setModel(null);
                /*
                let param = this.groupsByKeys[oEvent.getSource().getFieldGroupIds()[0]];
                let value = oEvent.getParameters().newValue;
                this.pageValues[param] = value;
                */
                var quality = this.getView().byId("steelQuality").getSelectedKey();
                var section = this.getView().byId("section").getSelectedKey();
                var size = this.getView().byId("size").getSelectedKey();

                this.pageValues.PROFILE = "";
                this.pageValues.LENGTH = "";
                this.pageValues.QUALITY = "";

                if (!!quality && !!section && !!size) {
                    this.pageValues.PROFILE = size;
                    this.pageValues.LENGTH = section;
                    this.pageValues.QUALITY = quality;
                    this.getMaterial();
                }

            },

            getMaterial: function () {
                TransactionCaller.async(
                    "ItelliMES/UI/MANUAL_ORDER_CREATION/T_GetMaterial",
                    {
                        I_LENGTH: this.pageValues.LENGTH,
                        I_PROFILE: this.pageValues.PROFILE,
                        I_QUALITY: this.pageValues.QUALITY,
                    },
                    "O_CHARACTERISTICS",
                    this.setCBModel,
                    this,
                    "GET",
                    "idMaterialCode"
                );
            },

            getOrderLocation: function () {
                TransactionCaller.async(
                    "ItelliMES/UI/MANUAL_ORDER_CREATION/T_GetStorageLocation",
                    {

                    },
                    "O_STORAGELOCATION",
                    this.setCBModel,
                    this,
                    "GET",
                    "idOrderPlace"
                );
            },

            getSDMStorageLocations: function () {
                TransactionCaller.async(
                    "ItelliMES/UI/MANUAL_ORDER_CREATION/T_GET_SDM_STORAGE_LOC", {},
                    "O_JSON",
                    this.getSDMStorageLocationsCBModel,
                    this,
                    "GET"
                );
            },

            getSDMStorageLocationsCBModel: function (iv_data, iv_scope, iv_param) {
                let objectModel = new JSONModel();
                var dummyData = iv_data[0].Rowsets.Rowset.Row.CLFN_VALUE.split(",");
                var jsonData = [];
                dummyData.forEach((index, input) => {
                    jsonData.push({ "CLFN_VALUE": index })
                });
                objectModel.setData(jsonData);
                iv_scope.getView().byId('idOrderStorageLocation').setModel(objectModel);
            },

            onCastChange: function (oEvent) {
                let param = this.groupsByKeys[oEvent.getSource().getFieldGroupIds()[0]];
                let value = oEvent.getParameters().newValue;
                let Tonnage = value * 110;
                let text = "Ton:" + Tonnage + " ";
                this.pageValues[param] = value;

                if (param == "CASTNUMBER" && value == "") {
                    this.getView().byId("castTonnageId").setEnabled(true);
                } else if (param == "CASTNUMBER" && value != "") {
                    this.getView().byId("castTonnageId").setEnabled(false);
                    this.getView().byId("totalCast").setValueStateText(text);
                } else if (param == "CASTWEIGHT" && value == "") {
                    this.getView().byId("totalCast").setEnabled(true);
                } else if (param == "CASTWEIGHT" && value != "") {
                    this.getView().byId("totalCast").setEnabled(false);
                }
            },

            callCharTrx: function (iv_charname, iv_objID) {
                TransactionCaller.async(
                    "ItelliMES/UI/MANUAL_ORDER_CREATION/T_GetCharacteristic",
                    {
                        I_CHARACTERISTIC: iv_charname,
                    },
                    "O_CHARACTERISTICS",
                    this.setCBModel,
                    this,
                    "GET",
                    iv_objID
                );
            },

            setCBModel: function (iv_data, iv_scope, iv_param) {
                if(iv_data[1]=='E'){
                    alert(iv_data[0]);
                    return;
                }
                let objectModel = new JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    objectModel.setData(iv_data[0]);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    objectModel.setData(obj_iv_data);
                }
                objectModel.setSizeLimit(10000);
                iv_scope.getView().byId(iv_param).setModel(objectModel);
            },

            ResourceBundle: function (iv_id) {
                var oBundle = this.getView().getModel("i18n").getResourceBundle();
                var txt = oBundle.getText(iv_id);
                return txt;
            },
            addNewOrder: function () {
                var siparisDepoYeri = this.getView().byId('idOrderStorageLocation').getSelectedKey();
                // var siviCelik = this.oView.byId("idSiviCelik").getState();
                var siparisYeri = this.oView.byId("idOrderPlace").getSelectedKey();
                var dokumNo = this.getView().byId("idDokumNo").getValue();
                var malzemeKodu = this.getView().byId("idMaterialCode").getSelectedKey();
                var dokumTonaji = this.getView().byId("castTonnageId").getValue();
                var uzunluk = this.pageValues.PROFILE;
                var kesit = this.pageValues.LENGTH;
                var kalite = this.pageValues.QUALITY;

                if(!!siparisDepoYeri && !!siparisYeri && !!dokumNo && !!malzemeKodu && dokumTonaji && !!uzunluk && !!kesit && !!kalite){
                    var response = TransactionCaller.async(
                        "ItelliMES/UI/MANUAL_ORDER_CREATION/T_MANUAL_ORDER",
                        {
                            I_CASTNO : dokumNo,
                            I_MATCODE : malzemeKodu,
                            I_ORDERPLACE : siparisYeri,
                            I_SDMOrderStorageLoc : siparisDepoYeri,
                            I_SIZE : dokumTonaji
                        },
                        "O_JSON",
                        this.addNewOrderCB,
                        this,
                        "GET"
                    );
                }
                else{
                    MessageToast.show("Tüm alanları doldurunuz");
                    return;
                }
                /*
                if (siviCelik == true) {
                    var SiviCelik;
                    SiviCelik = "X";
                } else {
                    var SiviCelik = "";
                }

                if (this.pageValues.CASTNUMBER != "") {
                    var castTon = this.pageValues.CASTNUMBER * 110;
                } else {
                    var castTon = this.pageValues.CASTWEIGHT;
                }
                var response = TransactionCaller.async(
                    "ItelliMES/UI/MANUAL_ORDER_CREATION/T_MANUAL_ORDER",
                    {
                        I_SIVI_CELIK: SiviCelik,
                        I_CASTNUMBER: castTon,
                        I_CASTNO: this.pageValues.CASTNUMBER,
                        I_STEELQUALITY: this.pageValues.QUALITY,
                        I_SECTION: this.pageValues.PROFILE,
                        I_SIZE: this.pageValues.LENGTH,
                        I_ORDERPLACE: orderLocation,
                        I_SDMOrderStorageLoc: SDMOrderStorageLocation,
                        I_MATCODE: this.pageValues.MATCODE,
                    },
                    "O_JSON",
                    this.addNewOrderCB,
                    this,
                    "GET"
                );
                */
            },

            addNewOrderCB: function (iv_data, iv_scope) {
                if (iv_data[1] == "E") {
                    var errorData = iv_data[0];
                    MessageToast.show(errorData);
                    return;
                } else {
                    MessageToast.show("Sipariş başarı ile eklendi.");
                }

            },
        });
    }
);


