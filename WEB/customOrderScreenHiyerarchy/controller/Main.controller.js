

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
		"customOrderScreen/scripts/transactionCaller",
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
		var that, sPath, myModel, tableModel, SFC;
		let frgData;
		return Controller.extend("ItelliMES.controller.customOrderScreen", {
			onInit: function () {
				// this.setDummyData();			
                
             //   SFC = jQuery.sap.getUriParameters().get("SFC");
              
                this.getParentChildOrdersList();
			},
			onPressReleaseButton:function(oEvent){
				var oTreeTable = this.byId("idOrderTable");
				var aSelectedIndices = oTreeTable.getSelectedIndices();
				var oModel = oTreeTable.getBinding("rows").getModel();
			
				var oContext = oTreeTable.getContextByIndex(aSelectedIndices[0]);
				var oData = oContext.getProperty();


			},
			onChangeBobinWidthInput:function(oEvent){
				alert("bastin");

			},
            
            getParentChildOrdersList: function(){
                
                TransactionCaller.async(
					"ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/ORDER_LIST/T_FindParentChildOrderList",
					{
						I_WORK_CENTER: "DM3",
					},
					"O_JSON",
					this.getParentChildOrdersListCB,
					this,
					"GET"
				);

            },
            
            getParentChildOrdersListCB:function(iv_data,iv_scope){

                var myModel = new sap.ui.model.json.JSONModel();              
				myModel.setData(iv_data[0]);			
               iv_scope.getView().byId("idOrderTable").setModel(myModel);

			},
			onPressCreateBobinButton:function(){

				if (!this._oDialogBobinCreate) {
					this._oDialogBobinCreate = sap.ui.xmlfragment(
						"Z_BobinCreate",
						"customOrderScreen.view.fragments.bobinCreate",
					
						this
					);
			
			   
			
					this.getView().addDependent(this._oDialogBobinCreate);
				}
			
			
				this._oDialogBobinCreate.open();
				this.getBobinDetailList()

			},
			getBobinDetailList: function(){
                
                TransactionCaller.async(
					"ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/BOBIN_CREATE/findOrderDetails/T_GetOrderDetailsFromSfcForBobinCreate",
					{
						I_SFC: "51007108",
					},
					"O_JSON",
					this.getBobinDetailListCB,
					this,
					"GET"
				);

            },
            
            getBobinDetailListCB:function(iv_data,iv_scope){

                var myModel = new sap.ui.model.json.JSONModel();              
				myModel.setData(iv_data[0]);			
				sap.ui.core.Fragment.byId("Z_BobinCreate", "idBobinCreateTable").setModel(myModel);

			},
			
			onPressCalculationButton: function(){
			
				this.getCalculationResult();
			

			},

					getCalculationResult: function(){

						var jsonData = sap.ui.core.Fragment.byId("Z_BobinCreate", "idBobinCreateTable").getModel().getJSON();
						var kantarWeight = sap.ui.core.Fragment.byId("Z_BobinCreate", "quantityField").getValue();

						if(kantarWeight==""){
							MessageBox.show("Miktar alanını doldurunuz.");
							return;
						}
                
                TransactionCaller.async(
					"ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/BOBIN_CREATE/calculationForBobinCreate/T_calculateBobinValuesForUserApproval",
					{
						I_KANTAR_WEIGHT:kantarWeight,
						I_DATA: jsonData,
					},
					"O_JSON",
					this.getCalculationResultCB,
					this,
					"GET"
				);

            },
            
            getCalculationResultCB:function(iv_data,iv_scope){


				if(iv_data[1]=="E"){

					MessageBox.show(iv_data[0]);
					return;
				}
                var myModel = new sap.ui.model.json.JSONModel();              
				myModel.setData(iv_data[0]);			
				sap.ui.core.Fragment.byId("Z_BobinCreate", "idBobinCreateTable").setModel(myModel);

			}

		
		});
	}
);
