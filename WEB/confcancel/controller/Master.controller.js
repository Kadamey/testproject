sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'sap/m/MessageBox',
	'editConfirmation/scripts/transactionCaller'
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox,TransactionCaller) {
	"use strict";

	return Controller.extend("editConfirmation.controller.Master", {
		onInit: function () {
			this.oView = this.getView();
			this.oRouter = this.getOwnerComponent().getRouter();
			
             		this.getAllWCS();
		},

          getAllWCS: function getAllWCS() {
              TransactionCaller.async(
                "ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/GET_ALL_WC/T_SlcAllWCList",
                {},
                "O_JSON",
                this.getAllWCSCB,
                this,
                "GET"
              );
            },
    
            getAllWCSCB: function getAllWCSCB(iv_data, iv_scope) {
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
    
              iv_scope.getView().byId("workCenterComboBox").setModel(myModel);
            },

            onWorkCenterComboBoxChange: function () {
              this.selectedWorkCenter = this.getView()
               .byId("workCenterComboBox")
               .getValue();


              // time ticket ve goods movement tablosunun icndeki dataları combo box secilince bosaltmak icin eklendi
               var dummyModel = new sap.ui.model.json.JSONModel();
               var dummyData =[];
               dummyModel.setData(dummyData);
          //     this.getView().byId("idOrderTimeTicketsTable").setModel(dummyModel);                 
          //     this.getView().byId("idGoodsMovementTable").setModel(dummyModel);

             this.getInitialDatas(this.selectedWorkCenter);
           },

          getInitialDatas: function (iv_workcenter) {

              TransactionCaller.async(
                  "ECZ_MES-4.0/COMMON/CONF_CANCEL/T_GetConfHeaderInfo",
                  {
                      I_WORK_CENTER:iv_workcenter
                  },
                  "O_JSON",
                  this.getInitialDatasCB,
                  this,
                  "GET"
              );

          },

          getInitialDatasCB: function (iv_data, iv_scope) {

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

              iv_scope.getView().byId("idOrderHeaderTable").setModel(myModel);


          },

		onPressOrderHeaderTable: function (oEvent) {
			var confNo = oEvent.getSource().getSelectedContexts()[0].getObject().ME_CONF_COUNT;
			this.getOwnerComponent().getHelper().then(function (oHelper) {

				var oNextUIState = oHelper.getNextUIState(1);
				this.oRouter.navTo("detail", {
					confNo: confNo,
					layout: oNextUIState.layout
				});
			}.bind(this));
		}
	});
});
