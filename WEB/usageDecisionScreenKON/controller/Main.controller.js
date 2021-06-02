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
		"usageDecisionScreenKON/scripts/transactionCaller",
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
		return Controller.extend("usageDecisionScreenKON.controller.Main", {
			onInit: function () {
			this.setDummyData();
                                  //  this.getAllLines();
			//	frgData = {
				//	frgData: [],
			//	};
			//	tableModel = new sap.ui.model.json.JSONModel();
            //    tableModel.setData(frgData);
                
              //  SFC = jQuery.sap.getUriParameters().get("SFC");
			},
			  setDummyData: function () {
          let dummyData = {
            dummydata: [
              {
                kolon1: "x",
                kolon2: "a",
                kolon3: "10",
              }, // saat:dakika:saniye gün/ay/yıl iki başlangıç bitiş arası 2 saat
              {
                kolon1: "y",
                kolon2: "a",
                kolon3: "20",
              },
              {
                kolon1: "z",
                kolon2: "b",
                kolon3: "30",
              },
            ],
          };
          var myModel = new sap.ui.model.json.JSONModel();
          myModel.setData(dummyData);
          this.getView().byId("idUsageDeciTable").setModel(myModel);
        },

			// Add fragment fonksiyonu-MOKTAY
			getDialog1: function () {
				if (!this._oDialog) {
					this._oDialog = sap.ui.xmlfragment(
						"usageDecisionScreen_Add",
						"usageDecisionScreen.view.fragments.usageDecisionScreen_Add",
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

			// Edit fragment fonksiyonu-MOKTAY
			getDialog2: function () {
				if (!this._oDialog) {
					this._oDialog = sap.ui.xmlfragment(
						"usageDecisionScreen_Edit",
						"usageDecisionScreen.view.fragments.usageDecisionScreen_Edit",
						this
					);
					this.getView().addDependent(this._oDialog);
				}
				// sap.ui.core.Fragment.byId(
				// 	"usageDecisionScreen_edit",
				// 	"idQuantityEdit"
				// ).setValue("");

				return this._oDialog;
			},

			onEditDecision: function () {
				this.getDialog2().open();
			},

			onFragmentEditCancel: function () {
				this.getDialog2().close();
			},

			onPressAddDecision: function (oEvent) {
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
				this.setDummyData();
				sap.ui.core.Fragment.byId(
					"usageDecisionScreen_Add",
					"idUsage"
				).setModel(myModel);
				sap.ui.core.Fragment.byId(
					"usageDecisionScreen_Add",
					"idLager"
				).setModel(myModel);
				// this.getDialog1().addEventDelegate(
				// 	{ onsapenter: this.onInputEditSave },
				// 	this
				// );
				// sap.ui.core.Fragment.byId("palletTable_Edit", "value1").setValue("");
			},

			// 			onFragmentSave: function (oEvent) {

			//                 debugger();

			// // this.getView().byId("idUidUsageDeciTablesage").setModel(myModel);

			//             },

			onFragmentSave: function (oEvent) {
				var iDecision = sap.ui.core.Fragment.byId(
					"usageDecisionScreen_Add",
					"idUsage"
				).getSelectedKey();
				var iLager = sap.ui.core.Fragment.byId(
					"usageDecisionScreen_Add",
					"idLager"
				).getSelectedKey();
				var iValue = sap.ui.core.Fragment.byId(
					"usageDecisionScreen_Add",
					"idQuantity"
				).getValue();

				if (iDecision == "") {
					MessageToast.show("Kullanım Kararı alanı boş bırakılamaz");
					return;
				}
				if (iLager == "") {
					MessageToast.show("Depo Yeri alanı boş bırakılamaz");
					return;
				}

				if (iValue == "") {
					MessageToast.show("Miktar alanı boş bırakılamaz");
					return;
				}
				// value = parseFloat(value.replace(",", "."));

				// if (isNaN(value)) {
				//     this.getView().byId("inputAdd").setValue("");
				//     MessageToast.show("Değer uygun formatta değil");
				//     return;
				// }

				var obj = { kolon1: "", kolon2: "", kolon3: "" };

				obj.kolon1 = iDecision;
				obj.kolon2 = iLager;
				obj.kolon3 = iValue;

				frgData.frgData.push(obj);
				tableModel.refresh();
				this.getView().byId("idUsageDeciTable").setModel(tableModel);

				this.getDialog1().close();

				// TransactionCaller.async("ItelliMES/UI/SINTER_SCREEN/T_INSERT_INTO_FRAGMENT", {
				//     I_MATERIALNO: materialNo,
				//     I_VALUE: value,
				//     I_USER: this.appData.user.userID,
				// },
				//     "O_JSON",
				//     this.onAddSaveCB,
				//     this,
				//     "GET"
				// );
			},

			// onAddSaveCB: function (iv_data, iv_scope) {
			//     MessageToast.show(iv_data[0]);
			//     iv_scope.getView().byId("comboAdd").setSelectedKey("");
			//     iv_scope.getView().byId("inputAdd").setValue("");
			//     iv_scope.getInitialBomTable();
			//     iv_scope.isClicked = false;
			// },

			onFragmentCancel: function () {
				this.getDialog1().close();
			},

			onDeleteFromTable: function (oEvent) {
				var oPath = parseInt(
					oEvent.getParameter("listItem").getBindingContextPath().split("/")[2]
				);
				tableModel.getData().frgData.splice(oPath, 1);
				tableModel.setData(frgData);
				this.getView().byId("idUsageDeciTable").setModel(tableModel);
			},

			onSaveDecision: function () {
				var jsonData = this.getView()
					.byId("idUsageDeciTable")
					.getModel()
					.getData().frgData;

				TransactionCaller.async(
					"ECZ_MES-4.0/KONVERTING/usageDecision_RFC/usageDecision_JsonToXml",
					{
						I_JSONDATA: JSON.stringify(jsonData),
					},
					"O_JSON",
					this.onSaveDecisionCB,
					this,
					"GET"
				);
			},

			onSaveDecisionCB: function (iv_data, iv_scope) {
				// MessageToast.show(iv_data[0]);
				MessageToast.show("Kullanım Kararı Başarı ile Gönderildi");
			},

			ResourceBundle: function (iv_id) {
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var txt = oBundle.getText(iv_id);
				return txt;
			},
		});
	}
);
