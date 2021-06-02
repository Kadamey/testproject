sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"KUMDailyReport/scripts/transactionCaller",
	"sap/ui/export/library",
	"sap/ui/export/Spreadsheet",
	"sap/m/MessageToast"
], function(Controller, TransactionCaller, ExportLibrary, Spreadsheet, MessageToast) {
	"use strict";
	var formattedDate, tableModel, table;
	return Controller.extend("KUMDailyReport.controller.Main", {

		onInit: function() {
			table = this.getView().byId("idTable");
			formattedDate = new Date();
			var now = new Date();
			this.getView().byId("idDatePicker").setMaxDate(now);
			this.getView().byId("idDatePicker").setDateValue(now);
			this.getView().byId("idDateColumnText").setText(now.toLocaleDateString("tr-TR") + "\n\n\n24.00 / 08.00");
			this.toIsoString(now);
			this.getTableValue(formattedDate);
		},

		onDateChange: function() {
			var selectedDate = this.getView().byId("idDatePicker").getDateValue();
			this.toIsoString(selectedDate);
			this.getView().byId("idDateColumnText").setText(selectedDate.toLocaleDateString("tr-TR") +
				"\n\n\n24.00 / 08.00");
			this.getTableValue(formattedDate);
		},

		toIsoString: function(date) {
			//	var tzo = -date.getTimezoneOffset(),
			//dif = tzo >= 0 ? '+' : '-',
			var pad = function(num) {
				var norm = Math.floor(Math.abs(num));
				return (norm < 10 ? '0' : '') + norm;
			};

			formattedDate = date.getFullYear() +
				'-' + pad(date.getMonth() + 1) +
				'-' + pad(date.getDate());
			/*	'T' + pad(date.getHours()) +
				':' + pad(date.getMinutes()) +
				':' + pad(date.getSeconds()) +
				dif + pad(tzo / 60) +
				':' + pad(tzo % 60);*/

		},

		getTableValue: function(formattedDate) {
			TransactionCaller.async("REPORTS/KAGIT/T_GetKUMDailyReport", {
					I_DATE: formattedDate
				},
				"O_JSON",
				this.getTableValueCB,
				this,
				"GET"
			);
		},

		getTableValueCB: function(iv_data, iv_scope) {
			tableModel = new sap.ui.model.json.JSONModel();
				if (Array.isArray(iv_data[0]?.Rowsets?.Rowset?.Row)) {
					tableModel.setData(iv_data[0]);
				} else if (!iv_data[0]?.Rowsets?.Rowset?.Row) {
					tableModel.setData(null);
				} else {
					var obj_iv_data = iv_data[0];
					var dummyData = [];
					dummyData.push(iv_data[0].Rowsets.Rowset.Row);
					obj_iv_data.Rowsets.Rowset.Row = dummyData;
					tableModel.setData(obj_iv_data);
				} 

			table.setModel(tableModel);

			iv_scope.setTableProperties();

		},

		setTableProperties: function() {
			if (tableModel.getData() !== null) {
				for (var i = 0; i < tableModel.getData().Rowsets.Rowset.Row.length; i++) {
					table.getItems()[i].removeStyleClass("lightGrey");
					table.getItems()[i].removeStyleClass("lightOrange");
					table.getItems()[i].removeStyleClass("lightGreen");
					table.getItems()[i].removeStyleClass("lightBlue");
					if (tableModel.getData().Rowsets.Rowset.Row[i].DESCRIPTION.length === 3) {
						table.getItems()[i].addStyleClass("lightGrey");
					}
					if (tableModel.getData().Rowsets.Rowset.Row[i].DESCRIPTION.includes("Günlük Brüt Ton")) {
						table.getItems()[i].addStyleClass("lightOrange");
					}
					if (tableModel.getData().Rowsets.Rowset.Row[i].DESCRIPTION.includes("Günlük Net Ton")) {
						table.getItems()[i].addStyleClass("lightGreen");
					}
					if (tableModel.getData().Rowsets.Rowset.Row[i].DESCRIPTION.includes("Vardiya Brüt Üretim")) {
						table.getItems()[i].addStyleClass("lightBlue");
					}
				}
			}

		},

		onExportExcel: function() {

			if (!tableModel.getData()) {
				MessageToast.show("Tabloda Veri Bulunmamaktadır.", {
					duration: 5000,
					at: "center center"
				});
			} else {
				var exportConfiguration = {
					workbook: {
						columns: [{
							label: '',
							property: 'DESCRIPTION',
							width: '35',
							textAlign: 'left'
						}, {
							label: '24.00 / 08.00',
							property: '_V1',
							width: '20',
							textAlign: 'center'
						}, {
							label: '08.00 / 16.00',
							property: 'V1',
							width: '20',
							textAlign: 'center'
						}, {
							label: '16.00 / 24.00',
							property: 'V2',
							width: '20',
							textAlign: 'center'
						}, {
							label: '19.05.2021\n24.00 / 08.00',
							property: 'V3',
							width: '20',
							textAlign: 'center'
						}]
					},
					dataSource: tableModel.getData().Rowsets.Rowset.Row,
					fileName: "Kagit-Uretim-Gunluk-Rapor-" + formattedDate
				};

				var oSheet = new Spreadsheet(exportConfiguration);
				oSheet.build().then(function() {
					MessageToast.show("Tablo Excel'e aktarıldı");
				});
			}

		},
		
		onExportPDF:function(){
			window.print();
		}

	});
});