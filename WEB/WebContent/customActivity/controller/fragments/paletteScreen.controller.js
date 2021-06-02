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
		"ItelliMES/scripts/transactionCaller",
		"sap/m/Dialog",
		"sap/m/Text",
		"sap/m/TextArea",
		"sap/m/Button",
		"sap/m/DialogType",
		"sap/m/ButtonType"
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
		TransactionCaller,
		Dialog,
		Text,
		TextArea,
		Button,
		DialogType,
		ButtonType
	) {
		"use strict";
		var that, sPath, line, unit, SFC;
		return Controller.extend("ItelliMES.controller.paletteScreen", {
			onInit: function () {

				this.setInitialData();
			
				//this.mesaj();		

			},

			setInitialData: function() {

				
				//this.setDummyData();
				this.getAllLines();				//paket miktarı anaveriden cekilip eklenecek
				this.getView().byId("palletteQuantityFieldId").setValue("60");
				
			},	
			
			getPackageDetails: function () {

				var selectedWorkCenter = this.getView().byId("idText1").getText();
				TransactionCaller.async(
					"ECZ_MES-4.0/KONVERTING/PALETTE_SCREEN/GET_PACKAGE_DETAILS/T_GetPackageDetailsFromSfcAndWC",
					{
						I_SFC:SFC,
						I_WORK_CENTER:selectedWorkCenter

					},
					"O_JSON",
					this.getPackageDetailsCB,
					this,
					"GET",
					{}
				);
			},
			getPackageDetailsCB: function (iv_data, iv_scope) {
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
				myModel.refresh();
				iv_scope.getView().byId("idPaletteTable").setModel(myModel);
			},

			mesaj: function () {
				MessageToast.show("Bilgiler Güncellendi");
			},
			// Tüm Hatları çeken fonksiyon- MOKTAY
			getAllLines: function (oEvent) {
				TransactionCaller.async(
					"ECZ_MES-4.0/KONVERTING/PALETTE_SCREEN/GET_CONV_WC/T_GET_CONVERT_WCS",
					{},
					"O_JSON",
					this.getAllLinesCB,
					this,
					"GET",
					{}
				);
			},
			getAllLinesCB: function (iv_data, iv_scope) {
				var myModel = new sap.ui.model.json.JSONModel();

				if (Array.isArray(iv_data[0])) {
					myModel.setData(iv_data[0]);
				} else {
					var obj_iv_data = iv_data[0];
					var dummyData = [];
					dummyData.push(iv_data[0]);
					obj_iv_data = dummyData;
					myModel.setData(obj_iv_data);
					myModel.refresh();
				}

				/*
				var oModel = new sap.ui.model.xml.XMLModel(iv_data);
				*/
				iv_scope.getView().byId("idLineComboBox").setModel(myModel);
				// iv_scope.getAllUnits();
			},
			// Tüm Üniteleri çeken fonksiyon- MOKTAY
			getAllUnits: function (oEvent) {
				TransactionCaller.async(
					"ECZ_MES-4.0/KONVERTING/PALETTE_SCREEN/GET_CONV_WC/T_GET_CHILD_WCS",
					{},
					"O_JSON",
					this.getAllUnitsCB,
					this,
					"GET"
				);
			},
			getAllUnitsCB: function (iv_data, iv_scope) {
				var myModel = new sap.ui.model.json.JSONModel();
				
				var arrayCheckObj = iv_data[0].CHILD_WORKCENTER.workCenterMemberList;
				if (Array.isArray(arrayCheckObj)) {
					myModel.setData(arrayCheckObj);
				} else {
					var arrayHolder = new Array();
					arrayHolder.push(arrayCheckObj);
					myModel.setData(arrayHolder);
				}
				iv_scope.getView().byId("idUnitComboBox").setModel(myModel);
			
			},
			//Ünite seçimi yapıldıktan sonra çalışan fonksiyon - MOKTAY
			onSelectLine: function (oEvent) {
				line = this.getView().byId("idLineComboBox").getSelectedKey();
				if (line == "") {
					this.getAllLines();
				} else if (!!line) {
					TransactionCaller.async(
						"ECZ_MES-4.0/KONVERTING/PALETTE_SCREEN/GET_CONV_WC/T_GET_CHILD_WCS", // ilk comboboxtan seçim yaptıktan sonra 2. comboboxa set edilecek değrlerin çekildiği transaction
						{
							I_LINE: line,
						},
						"O_JSON",
						this.onSelectLineCB,
						this,
						"GET"
					);
				}
			},
			//2.comboboxa değerlerin set edildiği fonksiyon
			onSelectLineCB: function (iv_data, iv_scope) {
				var myModel = new sap.ui.model.json.JSONModel();

				if(iv_data[0].CHILD_WORKCENTER==null){
					iv_scope.getView().byId("idUnitComboBox").setSelectedKey("");
					iv_scope.getView().byId("idUnitComboBox").setValue("");
					myModel.setData("");
					iv_scope.getView().byId("idUnitComboBox").setModel(myModel);
					return;
				}

				var arrayCheckObj = iv_data[0].CHILD_WORKCENTER.workCenterMemberList;
				if (Array.isArray(arrayCheckObj)) {
					myModel.setData(arrayCheckObj);
				} else {
					var arrayHolder = new Array();
					arrayHolder.push(arrayCheckObj);
					myModel.setData(arrayHolder);
				}

				iv_scope.getView().byId("idUnitComboBox").setModel(myModel);

				// ekran datalarini sifirlama
				var myModel = new sap.ui.model.json.JSONModel();
				var dummyArr=[];
				myModel.setData(dummyArr);
				iv_scope.getView().byId("idText1").setText("");
				iv_scope.getView().byId("orderQuantityFieldID").setText("");
				iv_scope.getView().byId("shopOrderFieldID").setText("");
				iv_scope.getView().byId("materialCodeFieldId").setText("");
				iv_scope.getView().byId("selectedBobinId1").setText("");
				iv_scope.getView().byId("selectedBobinId2").setText("");
				iv_scope.getView().byId("idPaletteTable").setModel(myModel);
			},

			onSelectUnit: function (oEvent) {
				unit = this.getView().byId("idUnitComboBox").getSelectedKey();
				if (unit == "") {
				} else if (!!unit) {
					 TransactionCaller.async(
					"ECZ_MES-4.0/KONVERTING/PALETTE_SCREEN/GET_ACTIVE_SFC/T_GetActiveOrderInfoFromWC",
					{
						I_WORK_CENTER: unit.split(",")[1]
						},
						"O_JSON",
						this.onSelectUnitCB,
						this,
						"GET",
						{}
					);
				}
				
			},
			onSelectUnitCB: function (iv_data, iv_scope) {
				var myModel = new sap.ui.model.json.JSONModel();

				if(iv_data[0].Results.Result1.Rowsets.Rowset.Row==undefined){
					var dummyArr=[];
					myModel.setData(dummyArr);

					iv_scope.getView().byId("idText1").setText("");
					iv_scope.getView().byId("orderQuantityFieldID").setText("");
					iv_scope.getView().byId("shopOrderFieldID").setText("");
					iv_scope.getView().byId("materialCodeFieldId").setText("");
					iv_scope.getView().byId("selectedBobinId1").setText("");
					iv_scope.getView().byId("selectedBobinId2").setText("");
					iv_scope.getView().byId("idPaletteTable").setModel(myModel);
					MessageToast.show("Seçilen iş yeri için aktif siparis bulunamadi");
					return;
				}


		

				if (Array.isArray(iv_data[0])) {
					myModel.setData(iv_data[0]);
				} else {
					var obj_iv_data = iv_data[0];
					var dummyData = [];
					dummyData.push(iv_data[0]);
					obj_iv_data = dummyData;
					myModel.setData(obj_iv_data);
					myModel.refresh();
				}
             var shopOrder= iv_data[0].Results.Result1.Rowsets.Rowset.Row.SHOP_ORDER;
            var sfcNO = iv_data[0].Results.Result1.Rowsets.Rowset.Row.SFC;
            var materialDescription = iv_data[0].Results.Result1.Rowsets.Rowset.Row.DESCRIPTION;
            var remainingQuantity = iv_data[0].Results.Result1.Rowsets.Rowset.Row.REMAINING;
            var completedQuantity= iv_data[0].Results.Result1.Rowsets.Rowset.Row.QTY_COMPLETED;
            var targetQuantity= iv_data[0].Results.Result1.Rowsets.Rowset.Row.TARGET;
            var materialNo = iv_data[0].Results.Result1.Rowsets.Rowset.Row.ITEM;
			var workCenter= iv_data[0].Results.Result1.Rowsets.Rowset.Row.WORK_CENTER;
			SFC = iv_data[0].Results.Result1.Rowsets.Rowset.Row.SFC;

			var selectedBobinId1 = iv_data[0].Results.Result2.Rowsets.Rowset?.Row[0].INVENTORY_ID;
			var selectedBobinIdDescription1 = iv_data[0].Results.Result2.Rowsets.Rowset?.Row[0]?.DESCRIPTION;
			var selectedBobinId2 = iv_data[0].Results.Result2.Rowsets.Rowset?.Row[1].INVENTORY_ID;
			var selectedBobinIdDescription2 = iv_data[0].Results.Result2.Rowsets.Rowset?.Row[1].DESCRIPTION;


                iv_scope.getView().byId("idText1").setText(workCenter);
                iv_scope.getView().byId("orderQuantityFieldID").setText(targetQuantity + " / " + completedQuantity + " / " + remainingQuantity);
                iv_scope.getView().byId("shopOrderFieldID").setText(shopOrder);
				iv_scope.getView().byId("materialCodeFieldId").setText(materialNo + " / " + materialDescription);
				iv_scope.getView().byId("selectedBobinId1").setText(selectedBobinId1 + " / " + selectedBobinIdDescription1);
				iv_scope.getView().byId("selectedBobinId2").setText(selectedBobinId2 + " / " + selectedBobinIdDescription2);
				

				
				//iv_scope.getView().byId("idUnitComboBox").setModel(myModel);
				iv_scope.getPackageDetails();
			},
			// Edit fragment fonksiyonu-MOKTAY
			getDialog1: function () {
				if (!this._oDialog) {
					this._oDialog = sap.ui.xmlfragment(
						"palletTable_Edit",
						"ItelliMES.view.fragments.palletTable_Edit",
						this
					);
					this.getView().addDependent(this._oDialog);
				}
				return this._oDialog;
			},
			setPaletteData: function () {
				var response = TransactionCaller.async(
					"xxxxxxxxxxxxxx",
					{},
					"O_JSON",
					this.setPaletteDataCB,
					this,
					"GET"
				);
			},
			setPaletteDataCB: function (iv_data, iv_scope) {
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
			
				//iv_scope.getView().byId("idPaletteTable").setModel(myModel);
				return myModel;
			},
			//Edit butonuna basılınca çalışan fonksiyon- MOKTAY
			onClickEdit: function (oEvent) {
				

				this.getDialog1().open();
				
			},

			onFragmentEditCancel: function (oEvent) {
				this.getDialog1().close();
			},

			//Rakamarı inputa yazan fonksiyon-MOKTAY
			onPressNumbers: function (oEvent) {
				oEvent.getSource().getText();
				this.getView()
					.byId("palletteQuantityFieldId")
					.setValue(
						this.getView().byId("palletteQuantityFieldId").getValue() +
							oEvent.getSource().getText()
					);
			},
			//Inputu tamamen silen fonksiyon-MOKTAY
			onPressClear: function (oEvent) {
				if (oEvent.getSource().getText() == "C") {
					this.getView().byId("palletteQuantityFieldId").setValue("");
				}
			},

			//Input içinde tekli Silme işlemi yapan fonksiyon-MOKTAY
			onPressBack: function () {
				var arrayexit = this.getView().byId("palletteQuantityFieldId")._lastValue;

				for (var i = 0; i < arrayexit.length; i++) {
					var output = arrayexit.slice(0, -1);
					this.getView().byId("palletteQuantityFieldId").setValue(output);
				}
			},


			//101 teyidi 
			onPressPrintPaletteButton:function(){

				if(this.getView().byId("shopOrderFieldID").getText()==""){
					MessageBox.show("Ekranda aktif siparis mevcut olmadığı için etiket basilamaz");
					return;
				}
				var selectedWorkCenter = this.getView().byId("idText1").getText();
				var palletteQuantityFieldId = this.getView().byId("palletteQuantityFieldId").getValue();

				// paket anaverisine göre revize edilecek şimdilik hardcode konuldu
				if(palletteQuantityFieldId != 60){
					
					if (!this.oApproveDialog) {
						this.oApproveDialog = new Dialog({
						  type: DialogType.Message,
						  title: "Confirm",
						  content: new Text({ text: "Paket adetini degistirdiniz, emin misiniz?" }),
						  beginButton: new Button({
							type: ButtonType.Emphasized,
							text: "Submit",
							press: function () {
								palletteQuantityFieldId = this.getView().byId("palletteQuantityFieldId").getValue();
								TransactionCaller.async(
									"ECZ_MES-4.0/KONVERTING/yieldConfirmation/101confirmation/T_MainTransactionKonvConfirmation101",
									{
										I_WORK_CENTER: selectedWorkCenter,
										I_SFC:SFC,
										I_QUANTITY:palletteQuantityFieldId,
										},
										"O_JSON",
										this.onPressPrintPaletteButtonCB,
										this,
										"GET",
										{}
									);
							  //  MessageToast.show("Submit pressed!");
							  this.oApproveDialog.close();
							  return;
			
							}.bind(this)
						  }),
						  endButton: new Button({
							text: "Cancel",
							press: function () {
							  this.oApproveDialog.close();
							}.bind(this)
						  })
						});
					  }
			
					  this.oApproveDialog.open();
				
				}else if ( palletteQuantityFieldId == 60){

				TransactionCaller.async(
					"ECZ_MES-4.0/KONVERTING/yieldConfirmation/101confirmation/T_MainTransactionKonvConfirmation101",
					{
						I_WORK_CENTER: selectedWorkCenter,
						I_SFC:SFC,
						I_QUANTITY:palletteQuantityFieldId,
						},
						"O_JSON",
						this.onPressPrintPaletteButtonCB,
						this,
						"GET",
						{}
					);
				}

			},

			onPressPrintPaletteButtonCB: function (iv_data, iv_scope) {
				var myModel = new sap.ui.model.json.JSONModel();

				if (Array.isArray(iv_data[0])) {
					myModel.setData(iv_data[0]);
				} else {
					var obj_iv_data = iv_data[0];
					var dummyData = [];
					dummyData.push(iv_data[0]);
					obj_iv_data = dummyData;
					myModel.setData(obj_iv_data);
					myModel.refresh();
				}				
				MessageBox.show(iv_data[0]);
				iv_scope.onSelectUnit();
				iv_scope.getPackageDetails();
				
			},
			// onPressSearchButton: function (oEvent) {
			// 	unit = this.getView().byId("idUnitComboBox").getSelectedKey();

			// 	if (line == "") {
			// 		//line seçimi yapılmamışsa
			// 		this.getAllLines();
			// 		MessageToast.show("Lütfen Hat Seçimi Yapınız.");
			// 	} else {
			// 		// line seçimi yapılmışsa
			// 		var unitModel = iv_scope
			// 			.getView()
			// 			.byId("idUnitComboBox")
			// 			.getModel()
			// 			.getData();

			// 		if (unitModel !== null && unitModel !== undefined) {
			// 			//combobox modeli doluysa
			// 			if (unit !== null && unit !== undefined) {
			// 				//dolu modelde seçim yapıldıysa
			// 				TransactionCaller.async(
			// 					"xxxxxxxxxxxxx", //  comboboxlardan yapıl seçime göre tablolara set edeceğim değrleri alacağım transaction
			// 					{
			// 						// I_LINE: line,
			// 						// I_UNIT: unit
			// 					},
			// 					"O_JSON",
			// 					this.onPressSearchButtonCB,
			// 					this,
			// 					"GET"
			// 				);
			// 			} else {
			// 				//dolu modelde seçim yapılmadıysa
			// 				MessageToast.show("Lütfen Ünite Seçimi Yapınız.");
			// 			}
			// 		} else {
			// 			// combobox modeli boşsa
			// 			TransactionCaller.async(
			// 				"xxxxxxxxxxxxx", //  comboboxlardan yapıl seçime göre tablolara set edeceğim değrleri alacağım transaction
			// 				{
			// 					// I_LINE: line,
			// 					// I_UNIT: unit
			// 				},
			// 				"O_JSON",
			// 				this.onPressSearchButtonCB,
			// 				this,
			// 				"GET"
			// 			);
			// 		}
			// 	}
			// },

			// onPressSearchButtonCB: function (iv_data, iv_scope) {
			// 	var myModel = new sap.ui.model.json.JSONModel();

			// 	if (Array.isArray(iv_data[0])) {
			// 		myModel.setData(iv_data[0]);
			// 	} else if (!!!iv_data[0]) {
			// 		myModel.setData(null);
			// 	} else {
			// 		var obj_iv_data = iv_data[0];
			// 		var dummyData = [];
			// 		dummyData.push(iv_data[0]);
			// 		obj_iv_data = dummyData;
			// 		myModel.setData(obj_iv_data);
			// 	}
			// 	iv_scope.getView().byId("idPalletTable").setModel(myModel);
			// },

			ResourceBundle: function (iv_id) {
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var txt = oBundle.getText(iv_id);
				return txt;
			},
		});
	}
);
