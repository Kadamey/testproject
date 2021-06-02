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
		var that, sPath, line, unit;
		return Controller.extend("ItelliMES.controller.paletteScreen", {
			onInit: function () {
				// that = this;
				// this.setPaletteData();
				this.mesaj();
				this.setDummyData();
				this.getAllLines();
				// this.getAllUnits();

				// var card = this.getView().byId("idHbox");
				// card.attachBrowserEvent("click", function(event) {
				//     // handle card click
				// }, this);
			},
			setDummyData: function () {
				let dummyData = {
					dummydata: [
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
						{ kolon1: "1", kolon2: "2" },
					],
				};
				var myModel = new sap.ui.model.json.JSONModel();
				myModel.setData(dummyData);
				this.getView().byId("idPaletteTable").setModel(myModel);
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
				/*
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
				*/
				// var arrayCheckObj = iv_data[0].CHILD_WORKCENTER.workCenterMemberList;
				// if (Array.isArray(arrayCheckObj)) {

				// 	myModel.setData(arrayCheckObj.workCenterRef.split(",")[1]);
				// } else {
				// 	var arrayHolder = new Array();
				// 	arrayHolder.push(arrayCheckObj.workCenterRef.split(",")[1]);
				// 	myModel.setData(arrayHolder);
				// }
				// iv_scope.getView().byId("idUnitComboBox").setModel(myModel);

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

			onSelectUnit: function (oEvent) {
				unit = this.getView().byId("idUnitComboBox").getSelectedKey();
				if (unit == "") {
				} else if (!!unit) {
					// TransactionCaller.async(
					// 	"ECZ_MES-4.0/KONVERTING/PALETTE_SCREEN/GET_SHOP_ORDER_INFO/T_GET_SHOP_ORDER_INFO",
					// 	{
					// 		I_UNIT: unit
					// 	},
					// 	"O_JSON",
					// 	this.onSelectUnitCB,
					// 	this,
					// 	"GET",
					// 	{}
					// );
				}
				this.getView()
					.byId("idText1")
					.setText(line + "/" + unit);
			},
			onSelectUnitCB: function (iv_data, iv_scope) {
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

				//iv_scope.getView().byId("idUnitComboBox").setModel(myModel);
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
				// let qualityTable = sap.ui.core.Fragment.createId(
				// 	"idqualityresultsfragment",
				// 	"idQualityResultTable"
				// );
				// qualityTable.setModel(myModel);
				iv_scope.getView().byId("idPaletteTable").setModel(myModel);
				return myModel;
			},
			//Edit butonuna basılınca çalışan fonksiyon- MOKTAY
			onClickEdit: function (oEvent) {
				// var oContext = oEvent.getSource().getBindingContext();
				// var oObject = oContext.getObject();

				// var myModel = new JSONModel();
				// var data = {
				// 	oldValue: this.ivalue,
				// 	MATCODE: oObject.MATCODE,
				// };
				// myModel.setData(data);
				// this.getView("palletTable_Edit", "fragmentOnEdit").setModel(myModel);

				this.getDialog1().open();
				// this.getDialog1().addEventDelegate(
				// 	{ onsapenter: this.onInputEditSave },
				// 	this
				// );
				// sap.ui.core.Fragment.byId("palletTable_Edit", "value1").setValue("");
			},

			onFragmentEditCancel: function (oEvent) {
				this.getDialog1().close();
			},

			//Rakamarı inputa yazan fonksiyon-MOKTAY
			onPressNumbers: function (oEvent) {
				oEvent.getSource().getText();
				this.getView()
					.byId("idPackagePc")
					.setValue(
						this.getView().byId("idPackagePc").getValue() +
							oEvent.getSource().getText()
					);
			},
			//Inputu tamamen silen fonksiyon-MOKTAY
			onPressClear: function (oEvent) {
				if (oEvent.getSource().getText() == "C") {
					this.getView().byId("idPackagePc").setValue("");
				}
			},

			//Input içinde tekli Silme işlemi yapan fonksiyon-MOKTAY
			onPressBack: function () {
				var arrayexit = this.getView().byId("idPackagePc")._lastValue;

				for (var i = 0; i < arrayexit.length; i++) {
					var output = arrayexit.slice(0, -1);
					this.getView().byId("idPackagePc").setValue(output);
				}
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
