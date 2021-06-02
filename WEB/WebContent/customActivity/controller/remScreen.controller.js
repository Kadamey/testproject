sap.ui.define(
    [
        "sap/m/MessageToast",
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/resource/ResourceModel",
        "sap/m/Dialog",
        "customActivity/model/formatter",
        "customActivity/scripts/transactionCaller",
        "customActivity/scripts/commonFunctions",
        "sap/m/MessageBox",
        "sap/ui/export/library",
        "sap/ui/export/Spreadsheet",
    ],
    function (
        MessageToast,
        Controller,
        JSONModel,
        Dialog,
        ResourceModel,
        formatter,
        TransactionCaller,
        commonFunctions,
        MessageBox,
        exportLibrary,
        Spreadsheet
    ) {
        "use strict";
        var that, materialIdList, materialIdArray, oTrigger;

        return Controller.extend("customActivity.controller.remScreen", {
            formatter: formatter,
            onInit: function (oEvent) {
                that = this;
                this.appComponent = this.getView().getViewData().appComponent;
                this.appData = this.appComponent.getAppGlobalData();
                this.MIIUSER = this.appData.user.userID;
                this.getRemMaterials();

                oTrigger = new sap.ui.core.IntervalTrigger(60000);
                oTrigger.addListener(() => {
                    this.getRemMaterials();
                }, this);
            },

            idRefreshDataPress: function () {
                oTrigger = new sap.ui.core.IntervalTrigger(60000);
                oTrigger.addListener(() => {
                    this.getRemMaterials();
                }, this);

                this.byId("idRefreshStop").setVisible(true);
                this.byId("idRefreshData").setVisible(false);
                MessageToast.show("Ekran yenileme başlatıldı");
            },

            idRefreshStopPress: function () {
                oTrigger.destroy();

                this.byId("idRefreshStop").setVisible(false);
                this.byId("idRefreshData").setVisible(true);
                MessageToast.show("Ekran yenileme durduruldu");
            },

            //EKRAN AÇILDIĞINDA COMBOBOXA MODELİ YÜKLEYEN FONKSİYON
            getRemMaterials: function () {
                if (this.getView().byId("idRemMaterialList") == undefined) {
                    oTrigger.destroy();
                    return;
                }

                TransactionCaller.async("ItelliMES/UI/REM/GetData/T_GetRemMaterials", {}, "O_JSON", this.getRemMaterialsCB, this);
            },

            getRemMaterialsCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                iv_scope.getView().byId("idRemMaterialList").setModel(myModel);
                iv_scope.getView().byId("idRemMaterialList").setSelectedKey("71000336");
                iv_scope.onMaterialSelected();
            },

            //COMBOBOXDA MALZEME SEÇİLMESİYLE ÇALIŞACAK FONKSİYON
            //MALZEME BİRİMİNİ EKRANA GETİRİYOR
            onMaterialSelected: function (oEvent) {
                TransactionCaller.async("ItelliMES/UI/CONSUMPTION_SCREEN/T_GetMaterialUOM", {
                    I_MATCODE: this.getView().byId("idRemMaterialList").getSelectedKey()
                },
                    "O_JSON",
                    this.onMaterialSelectedCB,
                    this
                );
            },

            onMaterialSelectedCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                iv_scope.getView().byId("idUnit").setValue(myModel.getData().Rowsets.Rowset.Row[0].MSEHI);
                iv_scope.getVersions(iv_scope.getView().byId("idRemMaterialList").getSelectedKey());
            },

            //COMBOBOXDA MALZEME SEÇİLMESİYLE ÇALIŞACAK FONKSİYON
            //MALZEME VERSİYONLARINI EKRANA GETİRİYOR
            getVersions: function (materialCode) {
                TransactionCaller.async("ItelliMES/UI/REM/GetVersion/T_GET_ITE_MT_LOIRSH_HDR", {
                    I_MATCODE: materialCode
                },
                    "O_JSON",
                    this.getVersionsCB,
                    this
                );
            },

            getVersionsCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                iv_scope.getView().byId("idVersionList").setModel(myModel);
                //TEK VERSİYON GELİYORSA DİREK COMBOBOXA VERSİYONU YAZMA
                if (iv_scope.getView().byId("idVersionList").getModel().getData().Rowsets.Rowset.Row.length == 1) {
                    iv_scope.getView().byId("idVersionList").setSelectedKey(iv_scope.getView().byId("idVersionList").getModel().getData().Rowsets.Rowset.Row[0].VERSION);
                }

                iv_scope.getMaterials(iv_scope.getView().byId("idRemMaterialList").getSelectedKey());
            },

            //TÜKETİM BÖLÜMÜ TABLOSUNU DOLDURAN FONKSİYON
            getMaterials: function (materialCode) {
                TransactionCaller.async("ItelliMES/UI/REM/GetData/T_GET_ITE_TT_SERIAL_PRODUCTION", {
                    I_WORKPLACE: this.appData.node.nodeID,
                    I_MATERIALCODE: materialCode
                },
                    "O_JSON",
                    this.getMaterialsCB,
                    this
                );
            },

            getMaterialsCB(iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                iv_scope.getView().byId("idRemComponentTable").setModel(myModel);

                //EKRANA TOPLAMI GELEN MALZEMELERİN TEK TEK ID'LERİNİN ARKA PLANDA TUTAN FONKSİYON
                iv_scope.getMaterial_List(iv_scope.getView().byId("idRemMaterialList").getSelectedKey());

                //MİKTAR ALANI DOLUYSA İŞLEM YAPAN FONKSİYON
                if (iv_scope.getView().byId("idQuantity").getValue() > 0) {
                    iv_scope.setMaterialQuantity();
                }
            },

            //EKRANA TOPLAMI GELEN MALZEMELERİN TEK TEK ID'LERİNİN ARKA PLANDA TUTAN FONKSİYON
            getMaterial_List: function (materialCode) {
                TransactionCaller.async("ItelliMES/UI/REM/GetData/T_GET_MATERIAL_ID_LIST", {
                    I_WORKPLACE: this.appData.node.nodeID,
                    I_MATERIALCODE: materialCode
                },
                    "O_JSON",
                    this.getMaterial_ListCB,
                    this
                );
            },

            getMaterial_ListCB(iv_data, iv_scope) {
                materialIdList = "";
                materialIdArray = [];

                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                //HER BİRİ 100 ELEMENTTEN OLUŞAN ARRAY İÇİNE ID'LERİN BASILMASI
                if (myModel.getData()?.Rowsets.Rowset.Row.length) {
                    for (var i = 0; i < Math.ceil(myModel.getData()?.Rowsets.Rowset.Row.length / 100); i++) {
                        materialIdList = "";
                        for (var j = 0; j < 100; j++) {
                            if (i * 100 + j == myModel.getData()?.Rowsets.Rowset.Row.length) {
                                break;
                            }
                            materialIdList = materialIdList + myModel.getData().Rowsets.Rowset.Row[i * 100 + j].ID + ",";
                        }
                        materialIdList = materialIdList.slice(0, -1);
                        materialIdArray[i] = materialIdList;
                    }
                }

                MessageToast.show("Bilgiler Güncellendi");
            },

            //MİKTAR DEĞİŞİMİ İLE TETİKLENEN FONKSİYON
            onChange: function (oEvent) {
                if (Number(this.getView().byId("idQuantity").getValue()) > 0) {
                    this.setMaterialQuantity();
                } else {
                    MessageBox.error("Malzeme miktarı 0 veya negatif değer olamaz");
                    this.getView().byId("idQuantity").setValue("");
                }
            },

            setMaterialQuantity: function () {
                TransactionCaller.async("ItelliMES/UI/CONSUMPTION_SCREEN/Set_KUKURT_SHD_PARAM/T_GET_MPM_MPH_CFN", {},
                    "O_JSON",
                    this.setMaterialQuantityCB,
                    this
                );
            },

            setMaterialQuantityCB: function (iv_data, iv_scope) {
                if (iv_data[1] == "E") {
                    MessageBox.error(iv_data[0]);
                } else {
                    //SIVI HAM DEMİR MALZEMESİNİ TABLODA GÜNCELLEYEN FONKSİYON
                    var constantValue = iv_data[0].Rowsets.Rowset.Row.CLFN_VALUE;
                    for (var i = 0; i < iv_scope.getView().byId("idRemComponentTable").getModel().oData.Rowsets.Rowset.Row.length; i++) {
                        if (iv_scope.getView().byId("idRemComponentTable").getModel().oData.Rowsets.Rowset.Row[i].MATCODE == "70000042") {
                            iv_scope.getView().byId("idRemComponentTable").getModel().oData.Rowsets.Rowset.Row[i].QUANTITY = Number(constantValue) * Number(
                                iv_scope.getView().byId("idQuantity").getValue());
                            iv_scope.getView().byId("idRemComponentTable").getModel().refresh();
                        }
                    }
                }
            },

            /*getDialog: function () {
                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment("Z_MANUAL_COMPONENT_ADD", "customActivity.view.fragments.remScreenAddMaterial", this);
                    this.getView().addDependent(this._oDialog);
                }
                return this._oDialog;
            },*/

            //YENİ MALZEME EKLEME FRAGMENTI AÇAN FONKSİYON
            /*onAdd: function (oEvent) {
                if (this.getView().byId("idRemMaterialList").getSelectedKey() != "") {
                    this.getDialog().open();
                } else {
                    MessageBox.error("Üretim bölümünden seçim yapmadan yeni malzeme ekleyemezsiniz");
                    return;
                }

                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualMaterial").setValue("");
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualQuantity").setValue("");
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualUnit").setValue("");

                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualMaterial").setEnabled(true);
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualUnit").setEnabled(true);

                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idAdd").setVisible(true);
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idEdit").setVisible(false);
                this.getRemMaterials2();
            },*/

            /*getRemMaterials2: function () {
                //Fragment açıldığında combobox içine malzemeleri doldur
                TransactionCaller.async("ItelliMES/UI/REM/GetData/T_GetRemMaterials2", {
                    I_MATERIALCODE: this.getView().byId("idRemMaterialList").getSelectedKey()
                },
                    "O_JSON",
                    this.getRemMaterials2CB,
                    this
                );
            },

            getRemMaterials2CB(iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualMaterial").setModel(myModel);
            },*/

            onManualMaterialSelected: function (oEvent) {
                TransactionCaller.async("ItelliMES/UI/CONSUMPTION_SCREEN/T_GetMaterialUOM", {
                    I_MATCODE: sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualMaterial").getSelectedKey()
                },
                    "O_JSON",
                    this.onManualMaterialSelectedCB,
                    this
                );
            },

            onManualMaterialSelectedCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                var materialUnit = myModel.getData().Rowsets.Rowset.Row[0].MSEHI;
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualUnit").setValue(materialUnit);
            },

            /*onManualAdd: function () {
                var materialCode = sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualMaterial").getValue().split("-")[0].trim();
                //var materialDescription = sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualMaterial").getValue().split("-")[1].trim();
                var quantity = sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualQuantity").getValue();
                var unitCode = sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualUnit").getValue();

                if (!materialCode || !quantity || !unitCode) {
                    MessageBox.error("Lütfen Malzeme, Miktar ve Birim alanlarını doldurunuz");
                    return;
                }

                if (Number(quantity) < 0) {
                    MessageBox.error("Miktar bilgisi 0'dan küçük olamaz");
                    return;
                }

                var oTableData = this.getView().byId("idRemComponentTable").getModel().getData();
                for (var i = 0; i < oTableData.Rowsets.Rowset.Row.length; i++) {
                    if (materialCode == oTableData.Rowsets.Rowset.Row[i].MATCODE) {
                        MessageBox.error("Ekranda mevcut olan bir malzemeyi tekrar sisteme ekleyemezsiniz. Lütfen malzeme miktarını düzenleyiniz.");
                        return;
                    }
                }

                TransactionCaller.async("ItelliMES/UI/REM/sendProduction/T_INS_ITE_TT_SERIAL_PRODUCTION", {
                    I_WORKPLACE: this.appData.node.nodeID,
                    I_MATERIAL: materialCode,
                    I_QUANTITY: quantity,
                    I_UNIT: unitCode,
                    I_MOVEMENTTYPE: "261",
                    I_USER: this.appData.user.userID
                },
                    "O_JSON",
                    this.onManualAddCB,
                    this
                );

                this._oDialog.close();
            },

            onManualAddCB: function (iv_data, iv_scope) {
                if (iv_data[1] == "E") {
                    MessageBox.error(iv_data[0]);
                } else {
                    MessageToast.show(iv_data[0]);
                    iv_scope.getMaterials(iv_scope.getView().byId("idRemMaterialList").getSelectedKey());
                }
            },*/

            onEdit: function (oEvent) {
                var path = this.getView().byId("idRemComponentTable").getSelectedContextPaths()[0];
                var selectedLine = this.byId("idRemComponentTable").getModel().getProperty(path);

                if (selectedLine == null) {
                    MessageBox.error("Lütfen tablodan seçim yapınız");
                    return;
                }

                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment("Z_MANUAL_COMPONENT_ADD", "customActivity.view.fragments.remScreenAddMaterial", this);
                    this.getView().addDependent(this._oDialog);
                }

                this._oDialog.open();
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualMaterial").setValue(selectedLine.MATCODE + " - " + selectedLine.MAKTX);
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualQuantity").setValue(selectedLine.QUANTITY);
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualUnit").setValue(selectedLine.UNIT);

                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualMaterial").setEnabled(false);
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualUnit").setEnabled(false);


                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idAdd").setVisible(false);
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idEdit").setVisible(true);
            },

            onManualUpdate: function () {
                var materialCode = sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualMaterial").getValue().split("-")[0].trim();
                var quantity = sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualQuantity").getValue();
                var unitCode = sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualUnit").getValue();

                if (!materialCode || !quantity || !unitCode) {
                    MessageBox.error("Lütfen Malzeme, Miktar ve Birim alanlarını doldurunuz");
                    return;
                }

                if (Number(quantity) < 0) {
                    MessageBox.error("Miktar bilgisi 0'dan küçük olamaz");
                    return;
                }

                TransactionCaller.async("ItelliMES/UI/REM/updateData/T_UPD_ITE_TT_SERIAL_PRODUCTION", {
                    I_WORKPLACE: this.appData.node.nodeID,
                    I_MATERIALCODE: materialCode,
                    I_QUANTITY: quantity,
                    I_UNIT: unitCode,
                    I_USER: this.appData.user.userID
                },
                    "O_JSON",
                    this.onManualUpdateCB,
                    this
                );

                this._oDialog.close();
            },

            onManualUpdateCB: function (iv_data, iv_scope) {
                if (iv_data[1] == "E") {
                    MessageBox.error(iv_data[0]);
                } else {
                    MessageToast.show(iv_data[0]);
                    iv_scope.getMaterials(iv_scope.getView().byId("idRemMaterialList").getSelectedKey());
                }
            },

            onManualCancel: function () {
                this._oDialog.close();
            },

            onPressRemDateFragment: function () {
                if (!this._oDateDialog) {
                    this._oDateDialog = sap.ui.xmlfragment("Z_REM_DATEPICKER", "customActivity.view.fragments.Z_REM_DATEPICKER", this);
                    this.getView().addDependent(this._oDateDialog);
                }
                this._oDateDialog.open();

                var current = new Date();

                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "idFragmentRemDatepicker").setBusy(false);

                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerStart").setInitialFocusedDateValue(current);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerEnd").setInitialFocusedDateValue(current);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerEnd").setMinDate(null);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "flexBoxTable").setVisible(false);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "idPacalTable").setModel(null);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerStart").setDateValue(null);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerEnd").setDateValue(null);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerStart").setValue(null);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerEnd").setValue(null);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "toplam").setText("");
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "vBoxToplam").setVisible(false);

            },

            onChangeStartDate: function () {
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "flexBoxTable").setVisible(false);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "vBoxToplam").setVisible(false);
                var selectedStartDate = sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerStart").getDateValue()
                if (!(!!selectedStartDate)) {
                    sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerEnd").setEnabled(false);
                    sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerEnd").setDateValue(null);
                    sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerEnd").setMinDate(null);
                }
                else {
                    sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerEnd").setMinDate(selectedStartDate);
                    sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerEnd").setEnabled(true);
                }

            },

            onPressCancelDate: function (oEvent) {
                this._oDateDialog.close();
            },

            onPressCalculateFromDate: function (oEvent) {
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "idPacalTable").setModel(null);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "flexBoxTable").setVisible(false);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "toplam").setText("");
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "vBoxToplam").setVisible(false);

                var beginDate = sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerStart").getDateValue();
                var endDate = sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerEnd").getDateValue();

                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerStart").setDateValue(null);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerEnd").setDateValue(null);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerStart").setValue(null);
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "datePickerEnd").setValue(null);

                if (!(!!beginDate) || !(!!endDate)) {
                    MessageBox.error("Zaman verileri boş bırakılamaz");
                    return;
                }
                if (beginDate > endDate) {
                    MessageBox.error("Başlangıç zamanı bitiş zamanından büyük olamaz");
                    return;
                }

                beginDate.setTime(beginDate.getTime() + (3 * 60 * 60 * 1000)); // GMT+3'ten dolayı ISOString 3 saat eksik gösteriyor
                endDate.setTime(endDate.getTime() + (3 * 60 * 60 * 1000));

                var isoBeginDate = beginDate.toISOString();
                var isoEndDate = endDate.toISOString();

                var matnr = "71000336";
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "idFragmentRemDatepicker").setBusy(true);

                TransactionCaller.async("ItelliMES/UI/REM/KUKURT_GIDERME/KGSH_URETIM/T_GET_KGHS_URETIM", {
                    IV_BEGIN_DATE: isoBeginDate,
                    IV_END_DATE: isoEndDate,
                    IV_MATNR: matnr
                },
                    "O_JSON",
                    this.onCalculateDateCB,
                    this
                );
            },

            onCalculateDateCB: function (iv_data, iv_scope) {
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "idFragmentRemDatepicker").setBusy(false);
                if (iv_data[1] == 'E') {
                    MessageBox.show(iv_data[0]);
                    return;
                }

                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                if (!!myModel.getData()) {
                    var arr = [];
                    arr = JSON.parse(JSON.stringify(myModel.getData()?.Rowsets?.Rowset?.Row));
                    if (arr.length > 0) {

                        var totalValue = 0;
                        arr.forEach((item) => totalValue += parseInt(item.QUANTITY));

                        sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "idPacalTable").setModel(myModel);
                        sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "flexBoxTable").setVisible(true);
                        sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "toplam").setText(totalValue + " TON");
                        sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "vBoxToplam").setVisible(true);
                    }
                }
            },

            onPacalBindingChange: function (oEvent) {
                sap.ui.core.Fragment.byId("Z_REM_DATEPICKER", "idPacalTable").setVisibleRowCount(oEvent.getSource().getLength());
            },

            checkIfUnderTen: function (num) {
                return num < 10 ? '0' + num : num.toString();
            },

            getFormattedDate: function (date) {
                var dateYear = date.getFullYear().toString();
                var dateMonth = this.checkIfUnderTen(date.getMonth() + 1);
                var dateDay = this.checkIfUnderTen(date.getDate());
                return dateYear + dateMonth + dateDay;
            },

            getFormattedTime: function (date) {
                var dateHours = this.checkIfUnderTen(date.getHours() + 3);
                var dateMinutes = this.checkIfUnderTen(date.getMinutes());
                var dateSeconds = this.checkIfUnderTen(date.getSeconds());
                return dateHours + dateMinutes + dateSeconds;
            },

            //TABLODAN MALZEME SİLME FONKSİYONU
            /*onDeleteRow: function (oEvent) {
                var sBindingPath = oEvent.oSource.getParent().getBindingContext().getPath();
                var selectedIndex = sBindingPath.split("/")[4];
                var oTableData = this.getView().byId("idRemComponentTable").getModel().getData();

                var materialID = oTableData.Rowsets.Rowset.Row[selectedIndex].MATCODE;

                MessageBox.confirm(materialID + " kodlu malzemme sistemden silinecektir! Onaylıyor musunuz?", {
                    actions: ["EVET", "HAYIR"],
                    emphasizedAction: "HAYIR",
                    onClose: function (sAction) {
                        if (sAction == "EVET") {
                            TransactionCaller.async("ItelliMES/UI/REM/deleteData/T_DEL_ITE_TT_SERIAL_PRODUCTION", {
                                I_WORKPLACE: that.appData.node.nodeID,
                                I_MATERIALCODE: materialID,
                                I_USER: that.appData.user.userID
                            }, "O_JSON",
                                that.onDeleteRowCB,
                                that
                            );
                        }
                    }
                });
            },

            onDeleteRowCB: function (iv_data, iv_scope) {
                if (iv_data[1] == "E") {
                    MessageBox.error(iv_data[0]);
                } else {
                    MessageToast.show(iv_data[0]);
                    iv_scope.getMaterials(iv_scope.getView().byId("idRemMaterialList").getSelectedKey());
                }
            },*/

            //TÜKETİMLERİ SİSTEME KAYDET BUTONUNA BASILMASI
            onSave: function (oEvent) {
                var materialcode = this.getView().byId("idRemMaterialList").getSelectedKey().padStart(18, '0');
                var version = this.getView().byId("idVersionList").getSelectedKey();
                var quantity = this.getView().byId("idQuantity").getValue();
                var unit = this.getView().byId("idUnit").getValue();
                var nodeID = this.appData.node.nodeID;
                var workcenter = this.appData.node.workcenterID;
                var userID = this.appData.user.userID;

                var oTableData = this.getView().byId("idRemComponentTable").getModel().getData();
                var iTableData = JSON.stringify(oTableData.Rowsets.Rowset.Row);

                if (materialcode != "" && version != "" && quantity != "" && unit != "") {
                    if (Number(quantity) > 0) {
                        if (iTableData != undefined) {
                            this.onExport();

                            //TÜKETİMİ YAPILAN MALZEMELERİN DB'DE GÜNCELLENMESİ
                            for (var i = 0; i < materialIdArray.length; i++) {
                                var response = TransactionCaller.sync("ItelliMES/UI/REM/KUKURT_GIDERME/T_UPD_ITE_TT_SERIAL_PRODUCTION", {
                                    I_MATERIAL_LIST: materialIdArray[i]
                                },
                                    "O_JSON"
                                );

                                if (response[1] == "E") {
                                    MessageBox.error(response[0]);
                                    return;
                                }
                            }

                            //TÜKETİM TEYİT RFC ÇAĞIRMA TRANSACTION
                            var response = TransactionCaller.sync("ItelliMES/UI/REM/KUKURT_GIDERME/T_GET_CONSUMPTION_DATA", {
                                I_MATERIALCODE: materialcode,
                                I_VERSION: version,
                                I_QUANTITY: quantity,
                                I_UNIT: unit,
                                I_NODEID: nodeID,
                                I_WORKCENTER: workcenter,
                                I_USER: userID,
                                I_DATA: iTableData,
                            },
                                "O_JSON"
                            );

                            if (response[1] == "E") {
                                MessageBox.error(response[0]);
                                return;
                            } else {
                                MessageBox.information(response[0]);
                            }

                            this.getMaterials(this.getView().byId("idRemMaterialList").getSelectedKey());
                            this.getView().byId("idQuantity").setValue("");
                            this.idRefreshDataPress();

                        } else {
                            MessageBox.error("Tüketim bölümünde kaydedilecek malzeme bulunamadı");
                            return;
                        }
                    } else {
                        MessageBox.error("Malzeme miktarı 0 veya negatif değer olamaz");
                        return;
                    }
                } else {
                    MessageBox.error("Üretim Bölümünde yer alan bilgileri eksiksiz doldurun");
                    return;
                }
            },

            //Tabloyu excele aktaran fonksiyon
            createColumnConfig: function () {
                return [
                    {
                        label: 'Malzeme Numarası',
                        property: 'MATCODE',
                        width: '20'
                    },
                    {
                        label: 'Malzeme Tanımı',
                        property: 'MAKTX',
                        width: '25'
                    },
                    {
                        label: 'Malzeme Miktarı',
                        property: 'QUANTITY',
                        width: '20'
                    },
                    {
                        label: 'Malzeme Birimi',
                        property: 'UNIT',
                        width: '20'
                    },
                    {
                        label: 'Son Kayıt/Güncelleme Zamanı',
                        property: 'INSDATE',
                        width: '20'
                    }
                ];
            },

            onExport: function () {
                var aCols = this.createColumnConfig();
                var aProducts = this.getView().byId("idRemComponentTable").getModel().getProperty('/').Rowsets.Rowset.Row;
                var oSettings = { workbook: { columns: aCols }, dataSource: aProducts };

                var oSheet = new Spreadsheet(oSettings);
                oSheet.build();
            }

        });
    }
);