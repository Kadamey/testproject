sap.ui.define(
    [
        "sap/m/MessageToast",
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/resource/ResourceModel",
        "sap/m/Dialog",
        "customActivity/model/formatter",
        "customActivity/scripts/transactionCaller",
        "sap/m/MessageBox",
    ],
    function (
        MessageToast,
        Controller,
        JSONModel,
        Dialog,
        ResourceModel,
        formatter,
        TransactionCaller,
        MessageBox
    ) {
        "use strict";
        var that;
        var _oldModelArr = []
        var isClicked = false;
        return Controller.extend("customActivity.controller.Z_SINTER_SCREEN", {
            formatter: formatter,
            onInit: function (oEvent) {
                that = this;
                this.appComponent = this.getView().getViewData().appComponent;
                this.appData = this.appComponent.getAppGlobalData();
                this.MIIUSER = this.appData.user.userID;

                this.dateFunction();
                this.getInitialBomTable();
                this.getMaterialLabelList();
                this.comboAddFill();
                this.getScaleValues();

                var input = this.getView().byId("idSclrInput2").getValue();
                var ojsonData = {
                    weight: input
                };
                var Model1 = new JSONModel(ojsonData);
                this.getView().setModel(Model1, "Model1");
                this.setEditableTable(false);
            },
            onPressEdit: function (oEvent) {
                var isEnabled = this.getView().getModel("view").oData.enabled; // undefined -> false
                this.setEditableTable(!isEnabled);
            },
            setEditableTable: function (bool) {
                var model = new JSONModel({
                    enabled: bool
                });
                this.getView().setModel(model, "view");
            },
            getScaleValues: function () {
                TransactionCaller.async("ItelliMES/UI/SINTER_SCREEN/Sinter_Scalers/T_SLC_ITE_TT_SINTER_SCALERS", {},
                    "O_JSON",
                    this.getScaleValuesCB,
                    this
                );
            },

            getScaleValuesCB: function (iv_data, iv_scope) {
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

                iv_scope.getView().byId("idSclr0").setValue(myModel.getData().Rowsets.Rowset.Row[0].YESTERDAY == "NA" ? 0 : myModel.getData().Rowsets
                    .Rowset.Row[0].YESTERDAY);
                iv_scope.getView().byId("idSclr1").setValue(myModel.getData().Rowsets.Rowset.Row[1].YESTERDAY == "NA" ? 0 : myModel.getData().Rowsets
                    .Rowset.Row[1].YESTERDAY);
                iv_scope.getView().byId("idSclr2").setValue(myModel.getData().Rowsets.Rowset.Row[2].YESTERDAY == "NA" ? 0 : myModel.getData().Rowsets
                    .Rowset.Row[2].YESTERDAY);
                iv_scope.getView().byId("idSclr3").setValue(myModel.getData().Rowsets.Rowset.Row[3].YESTERDAY == "NA" ? 0 : myModel.getData().Rowsets
                    .Rowset.Row[3].YESTERDAY);
                iv_scope.getView().byId("idSclr4").setValue(myModel.getData().Rowsets.Rowset.Row[4].YESTERDAY == "NA" ? 0 : myModel.getData().Rowsets
                    .Rowset.Row[4].YESTERDAY);
                iv_scope.getView().byId("idSclrInput").setValue(myModel.getData().Rowsets.Rowset.Row[5].YESTERDAY == "NA" ? 0 : myModel.getData().Rowsets
                    .Rowset.Row[5].YESTERDAY);

                iv_scope.getView().byId("idSclr5").setValue(myModel.getData().Rowsets.Rowset.Row[0].TODAY == "NA" ? 0 : myModel.getData().Rowsets.Rowset
                    .Row[0].TODAY);
                iv_scope.getView().byId("idSclr6").setValue(myModel.getData().Rowsets.Rowset.Row[1].TODAY == "NA" ? 0 : myModel.getData().Rowsets.Rowset
                    .Row[1].TODAY);
                iv_scope.getView().byId("idSclr7").setValue(myModel.getData().Rowsets.Rowset.Row[2].TODAY == "NA" ? 0 : myModel.getData().Rowsets.Rowset
                    .Row[2].TODAY);
                iv_scope.getView().byId("idSclr8").setValue(myModel.getData().Rowsets.Rowset.Row[3].TODAY == "NA" ? 0 : myModel.getData().Rowsets.Rowset
                    .Row[3].TODAY);
                iv_scope.getView().byId("idSclr9").setValue(myModel.getData().Rowsets.Rowset.Row[4].TODAY == "NA" ? 0 : myModel.getData().Rowsets.Rowset
                    .Row[4].TODAY);
                iv_scope.getView().byId("idSclrInput2").setValue(myModel.getData().Rowsets.Rowset.Row[5].TODAY == "NA" ? 0 : myModel.getData().Rowsets
                    .Rowset.Row[5].TODAY);

                return myModel;
            },

            onRefresh: function (oEvent) {
                this.getScaleValues();
                MessageToast.show("Bilgiler Güncellendi");
            },

            //Ekrandaki tarihleri ayarlayan fonksiyon agemici
            //OEE fonksiyonu ile date formatlama, ekrana dataları basma optimizasyonu - Kaan 30.09.2020
            dateFunction: function () {
                let today = new Date();
                let yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (!this.timeModel) {
                    this.timeModel = new JSONModel();
                }
                let timeData = {
                    today: sap.oee.ui.Utils.oeeDateFormatter.format(new Date(parseFloat(Date.parse(today)))),
                    yesterday: sap.oee.ui.Utils.oeeDateFormatter.format(new Date(parseFloat(Date.parse(yesterday)))),
                }
                this.timeModel.setData(timeData);
                this.getView().setModel(this.timeModel, "timeModel");
            },

            //Sinter özelindeki malzemeleri MII'dan ekrana getiren transaction
            getInitialBomTable: function () {
                TransactionCaller.async("ItelliMES/UI/SINTER_SCREEN/T_GET_SINTER_BOM", {},
                    "O_JSON",
                    this.getInitialBomTableCB,
                    this
                );
            },

            getInitialBomTableCB: function (iv_data, iv_scope) {
                if (iv_data[1] == 'E') {
                    MessageBox.show(iv_data[0]);
                    return;
                }

                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                }
                else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                _oldModelArr = [];
                if (!!myModel.getData()) {
                    myModel.getData().Rowsets.Rowset?.Row?.forEach((item, index, arr) => {
                        arr[index].BOMID = item.BOMID;
                        arr[index].MATDESC = item.MATDESC;
                        arr[index].MATCODE = item.MATCODE - 0;
                        arr[index].TOTAL = item.TOTAL.toFixed(2).toString().replace('.', ',');
                        arr[index].VALUE = item.VALUE.toFixed(2).toString().replace('.', ',');
                        arr[index].UNIT = item.UNIT;
                    });

                    myModel.getData().Rowsets.Rowset?.Row?.sort((a, b) => ((a.MATCODE > b.MATCODE) ? 1 : ((b.MATCODE) > a.MATCODE) ? -1 : 0));
                    _oldModelArr = JSON.parse(JSON.stringify(myModel.getData().Rowsets.Rowset?.Row));
                }

                iv_scope.getView().byId("idSinterTable").setModel(myModel);
                iv_scope.lastChangeRecord();
                return myModel;
            },

            //Kayıtlardaki son değişiklik zamanını ekrana getiren transaction
            lastChangeRecord: function () {
                TransactionCaller.async("ItelliMES/UI/SINTER_SCREEN/T_GET_TOBEORDERED", {},
                    "O_JSON",
                    this.lastChangeRecordCB,
                    this,
                    "GET"
                );
            },

            lastChangeRecordCB: function (iv_data, iv_scope) {
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

                iv_scope.getView().byId("lastChange").setText(myModel.getData().Rowsets.Rowset.Row[0].CDATE);
                return myModel;
            },

            //Ekrandaki comboboxların içini dolduracak sinter ürün ağacını çeken transaction
            getMaterialLabelList: function () {
                TransactionCaller.async("ItelliMES/UI/SINTER_SCREEN/T_GetMaterialList", {},
                    "O_JSON",
                    this.getMaterialLabelListCB,
                    this,
                    "GET"
                );
            },

            getMaterialLabelListCB: function (iv_data, iv_scope) {
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

                iv_scope.getView().byId("comboAdd").setModel(myModel);

                iv_scope.getView().byId("idBesleyiciKantar1").setModel(myModel);
                iv_scope.getView().byId("idBesleyiciKantar2").setModel(myModel);
                iv_scope.getView().byId("idBesleyiciKantar3").setModel(myModel);
                iv_scope.getView().byId("idBesleyiciKantar4").setModel(myModel);
                iv_scope.getView().byId("idBesleyiciKantar5").setModel(myModel);

                var response = TransactionCaller.sync("ItelliMES/UI/SINTER_SCREEN/T_GetScaleList", {}, "O_JSON");
                response[0].Rowsets?.Rowset?.Row.forEach((item, index) => {
                    iv_scope.getView().byId(iv_scope.sclNumberObjectIDReference[item.SCLNR]).setSelectedKey(item.MATCODE);
                }, this);

                return myModel;
            },

            sclNumberObjectIDReference: {
                1: "idBesleyiciKantar1",
                2: "idBesleyiciKantar2",
                3: "idBesleyiciKantar3",
                4: "idBesleyiciKantar4",
                5: "idBesleyiciKantar5",
            },

            //Ekrandaki comboxlarda bir madde seçilmesi durumunda MII üzerinde tutulması
            onClick: function (oEvent) {
                var iSclnr = oEvent.getSource().getFieldGroupIds()[0];
                var iMaterialNo = oEvent.getSource().getSelectedKey();
                if (iMaterialNo == "") {
                    iMaterialNo = oEvent.getSource().getValue();
                }

                TransactionCaller.async("ItelliMES/UI/SINTER_SCREEN/T_SINTER_SCALE", {
                    I_SCLNR: iSclnr,
                    I_MATCODE: iMaterialNo,
                },
                    "O_JSON",
                    this.onClickCB,
                    this,
                    "GET"
                );
            },

            onClickCB: function (iv_data, iv_scope) {
                MessageToast.show(iv_data[0]);
            },

            getDialog: function () {
                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment(
                        "Z_SINTER_SCREEN",
                        "customActivity.view.fragments.Z_SINTER_SCREEN",
                        this
                    );
                    this.getView().addDependent(this._oDialog);
                }
                return this._oDialog;
            },

            onAdd: function (oEvent) {
                this.getDialog().open();
                this.getDialog().addEventDelegate({ onsapenter: this.onAddSave }, this);
                sap.ui.core.Fragment.byId("Z_SINTER_SCREEN", "materialNo").setValue("");
                sap.ui.core.Fragment.byId("Z_SINTER_SCREEN", "value").setValue("");
                this.getMaterialLabelList();
                sap.ui.core.Fragment.byId("Z_SINTER_SCREEN", "materialNo").setFilterFunction(function (sTerm, oItem) {
                    //var item = oItem.getText().split('-')[1].substring(1);
                    var item = oItem.getText();
                    item = that.replaceTurkishCharacters(item);
                    sTerm = that.replaceTurkishCharacters(sTerm);
                    item = item.toLowerCase().replaceAll(' ', '').replaceAll(',', '').replaceAll('.', '');
                    sTerm = sTerm.toLowerCase().replaceAll(' ', '').replaceAll(',', '').replaceAll('.', '');
                    if (item.indexOf(sTerm) >= 0) {
                        return item.indexOf(sTerm) >= 0;
                    }
                    return item.includes(sTerm) || item.toUpperCase().includes(sTerm.toUpperCase());
                });

            },

            replaceTurkishCharacters: function (str) {
                str =
                    str
                        .replaceAll(/[\u0130]/g, 'I')
                        .replaceAll(/[\u00c7]/g, 'C')
                        .replaceAll(/[\u00d6]/g, 'O')
                        .replaceAll(/[\u015e]/g, 'S')
                        .replaceAll(/[\u011e]/g, 'G')
                        .replaceAll(/[\u00dc]/g, 'U')
                        .replaceAll(/[\u0131]/g, 'i')
                        .replaceAll(/[\u00e7]/g, 'c')
                        .replaceAll(/[\u00f6]/g, 'o')
                        .replaceAll(/[\u015f]/g, 's')
                        .replaceAll(/[\u011f]/g, 'g')
                        .replaceAll(/[\u00fc]/g, 'u');

                return str;
            },

            onAddSave: function () {
                if (!(!!this.isClicked) || !this.isClicked) {
                    this.isClicked = true;
                    //var iMaterialNo = sap.ui.core.Fragment.byId("Z_SINTER_SCREEN", "materialNo").getValue();
                    var materialNo = this.getView().byId("comboAdd").getSelectedKey();
                    var value = this.getView().byId("inputAdd").getValue();

                    if (materialNo == '') {
                        MessageToast.show("Malzeme No alanı boş bırakılamaz");
                        return;
                    }

                    if (value == '') {
                        MessageToast.show("Değer alanı boş bırakılamaz");
                        return;
                    }
                    value = parseFloat(value.replace(",", "."));

                    if (isNaN(value)) {
                        this.getView().byId("inputAdd").setValue("");
                        MessageToast.show("Değer uygun formatta değil");
                        return;
                    }

                    TransactionCaller.async("ItelliMES/UI/SINTER_SCREEN/T_INSERT_INTO_FRAGMENT", {
                        I_MATERIALNO: materialNo,
                        I_VALUE: value,
                        I_USER: this.appData.user.userID,
                    },
                        "O_JSON",
                        this.onAddSaveCB,
                        this,
                        "GET"
                    );
                }
            },

            onAddSaveCB: function (iv_data, iv_scope) {
                MessageToast.show(iv_data[0]);
                iv_scope.getView().byId("comboAdd").setSelectedKey("");
                iv_scope.getView().byId("inputAdd").setValue("");
                iv_scope.getInitialBomTable();
                iv_scope.isClicked = false;
            },

            onDeleteRow: function (oEvent) {
                /*
                var path = this.getView().byId("idSinterTable").getSelectedContextPaths()[0];
                if (path == undefined) {
                    return MessageToast.show("Lütfen tablodan bir satır seçiniz");
                }
                var selectedLine = this.byId("idSinterTable").getModel().getProperty(path);
                */
                var isEnabled = this.getView().getModel("view").oData.enabled;

                if (isEnabled) {

                    var oContext = oEvent.getSource().getBindingContext();
                    var oObject = oContext.getObject();

                    MessageBox.confirm(oObject.MATCODE + " kodlu malzeme sistemden silinecektir!\n Onaylıyor musunuz?", {
                        actions: ["Evet", "Hayır"],
                        emphasizedAction: "Hayır",
                        onClose: function (sAction) {
                            if (sAction == "Evet") {
                                TransactionCaller.async("ItelliMES/UI/SINTER_SCREEN/T_DELETE_SINTER_ROW", {
                                    I_BOMID: oObject.BOMID,
                                    I_USER: that.appData.user.userID
                                }, "O_JSON",
                                    that.onDeletedRowCB,
                                    that
                                );
                            }
                        }
                    });
                }


            },

            onDeletedRowCB: function (iv_data, iv_scope) {
                MessageToast.show(iv_data[0]);
                iv_scope.getInitialBomTable();
            },

            onEditRow: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext();
                var oObject = oContext.getObject();
                this.ivalue = oObject.VALUE;
                this.iBomId = oObject.BOMID;

                var myModel = new JSONModel();
                var data = {
                    oldValue: this.ivalue,
                    MATCODE: oObject.MATCODE
                };
                myModel.setData(data);
                this.getView("Z_SINTER_EDIT", "fragmentOnEdit").setModel(myModel);

                this.getDialog1().open();
                this.getDialog1().addEventDelegate({ onsapenter: this.onInputEditSave }, this);
                sap.ui.core.Fragment.byId("Z_SINTER_EDIT", "value1").setValue("");
            },

            onSave: function (oEvent) {
                var I_Besleyici_Kantar1 = this.getView().byId("idBesleyiciKantar1").mProperties.selectedKey;
                var I_Besleyici_Kantar2 = this.getView().byId("idBesleyiciKantar2").mProperties.selectedKey;
                var I_Besleyici_Kantar3 = this.getView().byId("idBesleyiciKantar3").mProperties.selectedKey;
                var I_Besleyici_Kantar4 = this.getView().byId("idBesleyiciKantar4").mProperties.selectedKey;
                var I_Besleyici_Kantar5 = this.getView().byId("idBesleyiciKantar5").mProperties.selectedKey;

                var I_Kantar1_Today = this.getView().byId("idSclr5").getValue();
                var I_Kantar2_Today = this.getView().byId("idSclr6").getValue();
                var I_Kantar3_Today = this.getView().byId("idSclr7").getValue();
                var I_Kantar4_Today = this.getView().byId("idSclr8").getValue();
                var I_Kantar5_Today = this.getView().byId("idSclr9").getValue();
                var I_Cevher_Today = this.getView().byId("idSclrInput2").getValue();

                var oTableData = this.getView().byId("idSinterTable").getModel().getData();
                var iTableData = JSON.stringify(oTableData.Rowsets.Rowset.Row);
                var iWorkcenterId = this.appData.node.workcenterID;
                var iUserId = this.appData.user.userID;

                if (I_Kantar1_Today != "NaN" && I_Kantar2_Today != "NaN" && I_Kantar3_Today != "NaN" && I_Kantar4_Today != "NaN" &&
                    I_Kantar5_Today != "NaN" && I_Cevher_Today != "NaN") {
                    if (I_Kantar1_Today != "" && I_Kantar2_Today != "" && I_Kantar3_Today != "" && I_Kantar4_Today != "" &&
                        I_Kantar5_Today != "" && I_Cevher_Today != "") {
                        TransactionCaller.async("ItelliMES/UI/SINTER_SCREEN/SendSinter/T_SEND_SINTER_DB", {
                            I_CEVHER: I_Cevher_Today,
                            I_DATA: iTableData,
                            I_KNTR1: I_Kantar1_Today,
                            I_KNTR2: I_Kantar2_Today,
                            I_KNTR3: I_Kantar3_Today,
                            I_KNTR4: I_Kantar4_Today,
                            I_KNTR5: I_Kantar5_Today,
                            I_KNTRMCODE1: I_Besleyici_Kantar1,
                            I_KNTRMCODE2: I_Besleyici_Kantar2,
                            I_KNTRMCODE3: I_Besleyici_Kantar3,
                            I_KNTRMCODE4: I_Besleyici_Kantar4,
                            I_KNTRMCODE5: I_Besleyici_Kantar5,
                            I_USER: iUserId,
                            I_WORKCENTER: iWorkcenterId,
                        },
                            "O_JSON",
                            this.onSaveCB,
                            this,
                            "GET"
                        );
                    } else {
                        MessageToast.show("Sisteme kaydedilecek değerler BOŞ olamaz!");
                    }
                } else {
                    MessageToast.show("Sisteme kaydedilecek değerler TANIMSIZ (NaN) olamaz!");
                }
            },

            onSaveCB: function (iv_data, iv_scope) {
                MessageToast.show(iv_data[0]);
            },

            onSubmitInput: function (oEvent) {
                var selectedId = this._oTableEvent.oSource.getSelectedItem().mAggregations.cells[2].sId;
                var row = this._oTableEvent.oSource.getSelectedItem().getBindingContext().getObject();
                var oldValue = _oldModelArr.filter((x) => x.MATCODE == row.MATCODE)[0].VALUE;

                var value = this.getView().byId(selectedId).getValue();

                if (!(!!value) || !(value.trim().length > -1)) {
                    MessageToast.show("Değer alanı boş bırakılamaz");
                    this.getView().byId(selectedId).setValue(oldValue.replaceAll('.', ','));
                    return;
                }

                value = value.replaceAll(',', '.');
                oldValue = oldValue.replaceAll(',', '.');

                if (isNaN(parseFloat(value))) {
                    MessageToast.show("Değer geçersiz");
                    this.getView().byId(selectedId).setValue(oldValue.replaceAll('.', ','));
                    return;
                }

                var response = TransactionCaller.sync("ItelliMES/UI/SINTER_SCREEN/T_EDIT_SINTER_ROW", {
                    I_BOMID: row.BOMID,
                    I_VALUE: parseFloat(value),
                    I_OLDVALUE: parseFloat(oldValue),
                    I_USER: this.appData.user.userID,
                },
                    "O_JSON",
                );

                if (response[1] == 'E') {
                    MessageToast.show(response[0]);
                    this.getView().byId(selectedId).setValue(oldValue);
                    return;
                }
                this.getView().byId(selectedId).setEditable(false);
                this.getInitialBomTable();
            },

            onSubmitNewInput: function (oEvent) {
                this.onAddSave();
            },

            onKeyPressInput: function (oEvent) {
                var keyPress;
            },

            onPressTableRow: function (oEvent) {
                oEvent.getSource().mAggregations.items.forEach((item) => {
                    this.getView().byId(item.mAggregations.cells[2].sId).setEditable(false);
                });
                var selectedRowInputId = oEvent.getSource().getSelectedItem().mAggregations.cells[2].sId;
                this._oTableEvent = Object.assign({}, oEvent);
                this.getView().byId(selectedRowInputId).setEditable(true);
                sap.ui.getCore().byId(selectedRowInputId).onkeypress = function (e) {
                    that.valueInputFilter(that, e, selectedRowInputId);
                }
            },

            comboAddFill: function () {
                this.getView().byId("comboAdd").setValue("");
                this.getView().byId("inputAdd").setValue("");
                this.getView().byId("comboAdd").setFilterFunction(function (sTerm, oItem) {
                    //var item = oItem.getText().split('-')[1].substring(1);
                    var item = oItem.getText();
                    item = that.replaceTurkishCharacters(item);
                    sTerm = that.replaceTurkishCharacters(sTerm);
                    item = item.toLowerCase().replaceAll(' ', '').replaceAll(',', '').replaceAll('.', '');
                    sTerm = sTerm.toLowerCase().replaceAll(' ', '').replaceAll(',', '').replaceAll('.', '');
                    if (item.indexOf(sTerm) >= 0) {
                        return item.indexOf(sTerm) >= 0;
                    }
                    return item.includes(sTerm) || item.toUpperCase().includes(sTerm.toUpperCase());
                });
                this.getView().byId("inputAdd").onkeypress = function (e) {
                    that.valueInputFilter(that, e, "inputAdd");
                }
            },

            valueInputFilter: function (that, e, inputId) {
                var val = that.getView().byId(inputId).getValue();
                var charValue = String.fromCharCode(e.keyCode);
                if (val.includes('.') || val.includes(',')) {
                    if (charValue == ',' || charValue == '.') {
                        e.preventDefault();
                        return;
                    }
                }
                if (val.length > 6) {
                    e.preventDefault();
                    return;
                }
                if (((isNaN(parseInt(charValue))) && (e.which != 8) && charValue != ',' && charValue != '.')) { // BSP KB code is 8
                    e.preventDefault();
                }
                return true;
            },
            
            ResourceBundle: function (iv_id) {
                var oBundle = this.getView().getModel("i18n").getResourceBundle();
                var txt = oBundle.getText(iv_id);
                return txt;
            },
            // onEditRow iptal
        });
    }
);