sap.ui.define(
    [
        "sap/m/MessageToast",
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/resource/ResourceModel",
        "customActivity/scripts/transactionCaller"
    ],
    function (
        MessageToast,
        Controller,
        JSONModel,
        ResourceModel,
        TransactionCaller
    ) {
        "use strict";
        var that;
        return Controller.extend("customActivity.controller.Z_PERSONNEL_SCREEN", {
            onInit: function (oEvent) {

                that = this;
                this.appComponent = this.getView().getViewData().appComponent;
                this.appData = this.appComponent.getAppGlobalData();

                this.appComponent.getRouter().attachRouteMatched(this.onRouteMatched, this);
                this.SelectPersonel();
             ///Shiftte olan personellerin gelmesi için eklendi.-DamlaB 30042020
               this.appComponent.getEventBus().subscribe(this.appComponent.getId(), "shiftChange", this.handleShiftChange, this);
            },
               handleShiftChange : function(channelId, eventId, data){
                              if (eventId === "shiftChange") {  
                                 this.SelectPersonel();
                              }          
                   this.appComponent.getEventBus().publish(this.appComponent.getId(), "shiftChanged");
               },
            //////////////////////////////////////////////////////////////////////////////////   

            onRouteMatched: function (oEvent) {
                if (oEvent.getParameters().arguments.activityId == "Z_PERSONNEL_SHIFT") {

                    this.oTrigger = new sap.ui.core.IntervalTrigger(30000);
                    this.oTrigger.addListener(() => {
                        this.SelectPersonel();
                    }, this);

                }
            
            else {
                            //  debugger;
        }
    },

 ResourceBundle: function (iv_id) {
                var oBundle = this.getView()
                    .getModel("i18n")
                    .getResourceBundle();
                var txt = oBundle.getText(iv_id);
                return txt;
            },

            addPersonalNumber: function () {
                var input1 = this.getView()
                    .byId("inputNumber")
                    .getValue();

                if (input1 == "") {
                    var sMsg = this.ResourceBundle("KardemirAddPersonalNumber");
                    MessageToast.show(sMsg);
                } else {
                    this.InsertPersonel(input1);
                }
            },

            InsertPersonel: function (input1) {
                var nodeId = this.appData.node.nodeID;
                var runId = this.appData.selected.runID;
                var userID = this.appData.user.userID;
                var response = TransactionCaller.async(
                    "ItelliMES/UI/PERSONNEL_SHIFT_SCREEN/T_INSERT_PERSCODE",
                    { I_PERSCODE: input1, I_NODEID: nodeId, I_RUNID: runId, I_USER: userID  },
                    "O_JSON",
                    this.InsertPersonelCB,
                    this,
                    "GET"
                );
            },

            InsertPersonelCB: function (iv_data, iv_scope) {
                if (iv_data[1] == "E") {
                    var errorData = iv_data[0];
                    MessageToast.show(errorData);
                } else {
                    iv_scope
                        .getView()
                        .byId("inputNumber")
                        .setValue("");
                    var oBundle = iv_scope
                        .getView()
                        .getModel("i18n")
                        .getResourceBundle();
                    var sMsg = oBundle.getText("KardemirAddPersonal");
                    MessageToast.show(sMsg);
                    iv_scope.SelectPersonel();
                }

                //  iv_scope.SelectPersonel();
            },

            SelectPersonel: function () {
                var NodeId = this.appData.node.nodeID;
                var currStartTime = new Date(this.appData.shift.startTimestamp).toISOString();
                var currEndTime = new Date(this.appData.shift.endTimestamp).toISOString();
                var oPanel = this.getView().byId("idProductsTable");
                var response = TransactionCaller.async(
                    "ItelliMES/UI/PERSONNEL_SHIFT_SCREEN/T_SELECT_PERSCODE",
                    {
                        I_NODEID: NodeId,
                        I_STARTTIME: currStartTime,
                        I_ENDTIME: currEndTime
                    },
                    "O_JSON",
                    this.SelectPersonelCB,
                    this
                );
            },

            SelectPersonelCB(iv_data, iv_scope) {
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

                that
                    .getView()
                    .byId("idProductsTable")
                    .setModel(myModel);
                that
                    .getView()
                    .byId("idProductsTable")
                    .setBusy(false);

                that
                    .getView()
                    .byId("idProductsTable")
                    .getModel()
                    .refresh();
                return myModel;
            },
            DeletePerson: function (oEvent) {

                var jsonData = []; //16.03.2020 arraya çevirdim - kaan

                this.getView().byId("idProductsTable").getSelectedContextPaths().forEach((item, index) => {
                    jsonData.push(this.getView().byId("idProductsTable").getModel().getData().Rowsets.Rowset.Row[item.substr(item.lastIndexOf("/") + 1)]);
                }, this);

                if (jsonData.length <= 0) {
                    var sMsg = this.ResourceBundle("KardemirSelectedPerson");
                    MessageToast.show(sMsg);
                }


                var userID = this.appData.user.userID;
                var response = TransactionCaller.async(
                    "ItelliMES/UI/PERSONNEL_SHIFT_SCREEN/T_DELETE_PERSON",
                    //{ I_PERSCODES: JSON.stringify(jsonData) },
                    {
                        I_PERSCODES: JSON.stringify(jsonData),
                        I_USER: userID
                    },
                    "O_JSON",
                    this.DeletePersonCB,
                    this
                );
                this.SelectPersonel();
            },

            DeletePersonCB: function (iv_data, iv_scope) {

                if (iv_data[1] == "E") {
                    var errorData = iv_data[0];
                    MessageToast.show(errorData);
                } else {
                    iv_scope.SelectPersonel();
                }

            }
        });
    }
);








