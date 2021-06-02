// Controller definition
sap.ui.define(
	[
		"jquery.sap.global",
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/Filter",
		"sap/ui/model/json/JSONModel",
		"customActivity/scripts/TransactionCaller_old",
		"sap/m/MessageToast",
	],
	function (
		jQuery,
		Controller,
		Filter,
		JSONModel,
		TransactionCaller,
		MessageToast
	) {
		"use strict";

		return Controller.extend("customActivity.controller.Z_CON_BACK", {
			onInit: function () {
				{
                    
                    this.appComponent = this.getView().getViewData().appComponent;
                    this.appData = this.appComponent.getAppGlobalData();
                    var nodeID =   this.appData.node.nodeID;
                    var startTime= new Date(this.appData.shift.startTimestamp).toISOString();
                    var endTime =  new Date(this.appData.shift.endTimestamp).toISOString();
                    
                    this.getData(nodeID,startTime,endTime);

					
				}
			},

			addPersonalNumber: function () {
                var nodeID =   this.appData.node.nodeID;
                var startTime= this.appData.shift.startTime;
                var endTime =  this.appData.shift.endTime;
                var persCode = this.getView().byId("inputNumber").getValue();
                var runId=     this.appData.selected.runID;
                var userId=    this.appData.user.userID;

				var response = TransactionCaller.async(
                    "ItelliMES/UI/PERSONNEL_SHIFT_SCREEN/T_INSERT_PERSCODE",
					{
                        I_NODEID:nodeID,
                        I_PERSCODE:persCode,
                        I_RUNID:runId,
                        I_USER:userId

                    },
					"O_JSON",
					this.addPersonalNumberCB,
					this,
					"GET"
				);
            },
            
            addPersonalNumberCB: function (iv_data, iv_scope) {
				if (iv_data[1] == "E") {
					alert(iv_data[0]);
				} else {
					MessageToast.show("Tüketim başarı ile kaydedildi.");

	
				}
			},

            getData:function (nodeID,startTime,endTime){

                var response = TransactionCaller.async(
					"ItelliMES/UI/PERSONNEL_SHIFT_SCREEN/T_SELECT_PERSCODE",
					{ I_NODEID: nodeID, I_STARTTIME: startTime,I_ENDTIME:endTime  },
					"O_JSON",
					this.getDataCB,
					this,
					"GET"
				);


            },

            getDataCB: function (iv_data, iv_scope) {
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

				//myModel.setData(iv_data[0]);
				iv_scope.getView().byId("idProductsTable").setModel(myModel);
				iv_scope.getView().byId("idProductsTable").setBusy(false);

				iv_scope.getView().byId("idProductsTable").getModel().refresh();
				return myModel;
			},

			
			DeletePerson: function(){
				var oTable = this.getView().byId("idProductsTable");
				var idx = oTable.indexOfItem(oTable.getSelectedItem());
				if(idx !== -1){
				var oItems = oTable.getSelectedItems();
				var oSelectedItems = [];
				for(var i=0;i<oItems.length;i++){
						oSelectedItems.push(oItems[i].getBindingContext().getObject());
				}
				alert("Selected qweqweqwItems: " + JSON.stringify(oSelectedItems));
				}else{
					alert("Please Select an Item");
				}
			},
			
			

        });

        
	}
);
