sap.ui.define(
	[
		"sap/ui/core/library",
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/ui/core/Fragment",
		"sap/m/MessageBox",
		"sap/m/Dialog",
		"sap/m/DialogType",
		"sap/m/Button",
		"sap/m/ButtonType",
		"stoppageScreen/scripts/transactionCaller",
		"sap/ui/core/BusyIndicator"
	],
	function (
		coreLibrary,
		Controller,
		JSONModel,
		MessageToast,
		Fragment,
		MessageBox,
		Dialog,
		DialogType,
		Button,
		ButtonType,
		TransactionCaller,
		BusyIndicator
	) {
		"use strict";
		var ValueState = coreLibrary.ValueState;
		var that, updateIndex, transferIndex, splitIndex, oTrigger, mode, bobinIndex, flag, TransferWorkplace;

		return Controller.extend("stoppageScreen.controller.Main", {
			onInit: function () {
				that = this;
				this.transferRefresh = true;
				this.SITE = jQuery.sap.getUriParameters().get("SITE");
				this.RESOURCE = jQuery.sap.getUriParameters().get("RESOURCE")?.replace("RES_", "");
				this.getAllLines();
				this.getFuncLocList();
				this.getAllStoppageTypes();

				//Filtre alanındaki tarih ve vardiya alanlarını ekran açılınca set eden fonksiyon
				var currentDate = new Date();
				this.getView().byId("INP13").setDateValue(currentDate);
				this.filter13 = this.getView().byId("INP13").getDateValue().toISOString();

				if (currentDate.getHours() < 8) {
					this.getView().byId("INP14").setSelectedKey("1");
				} else if (8 <= currentDate.getHours() && currentDate.getHours() < 16) {
					this.getView().byId("INP14").setSelectedKey("2");
				} else if (currentDate.getHours() >= 16) {
					this.getView().byId("INP14").setSelectedKey("3");
				}
				this.filter14 = this.getView().byId("INP14").getSelectedKey();

				//Dakikada 1 kere ekran yenileyen fonks.
				oTrigger = new sap.ui.core.IntervalTrigger(60000);
				oTrigger.addListener(() => {
					this.getPMNotificationDatas();
				}, this);
			},

			//Ekrandaki süre kolonunu formatlayan fonksiyonu
			statusText: function (duration) {
				if (duration == null) {
					return "";
				} else {
					if (Math.floor(duration / 60) == 0) {
						return duration % 60 + " sn ";
					} else {
						if (duration % 60 == 0) {
							return Math.floor(duration / 60) + " dk ";
						} else {
							return Math.floor(duration / 60) + " dk " + duration % 60 + " sn ";
						}
					}
				}
			},

			//Filtre Seçenekleri panelini açıp kapatan fonksiyon
			onOverflowToolbarPress: function (oEvent) {
				var oPanel = this.byId("expandablePanel");
				oPanel.setExpanded(!oPanel.getExpanded());
			},

			//Ekrandaki İş Yeri ComboBox'ın modelini atayan fonksiyon (Kullanıcının yetkileri dahilinde geliyor iş yerleri)
			getAllLines: function (oEvent) {
				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/findWorkCenters/T_GetWCFromSite", {
						I_SITE: this.SITE
					},
					"O_JSON"
				);

				if (response[1] == "E") {
					MessageBox.error(response[0]);
				} else {
					var myModel = new sap.ui.model.json.JSONModel();
					if (Array.isArray(response[0]?.Rowsets?.Rowset?.Row)) {
						myModel.setData(response[0]);
					} else if (!response[0]?.Rowsets?.Rowset?.Row) {
						myModel.setData(null);
					} else {
						var obj_iv_data = response[0];
						var dummyData = [];
						dummyData.push(response[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						myModel.setData(obj_iv_data);
					}

					if (this.transferStoppageFragment) {
						sap.ui.core.Fragment.byId("Z_TRANSFER_DOWNTIME", "idTransferWorkplace").setModel(myModel);
						sap.ui.core.Fragment.byId("Z_TRANSFER_DOWNTIME", "idTransferWorkplace").getModel().refresh();
					} else {
						this.getView().byId("idWsComboBox").setModel(myModel);
						this.getView().byId("idWsComboBox").getModel().refresh();
						this.getView().byId("idWsComboBox").setSelectedKey(this.RESOURCE);
					}
				}
			},

			//Ekrandan Filtreleme Seçenekleri içinde Filtrele Butonuna basılınca çalışan fonks.
			onPressSearchFilter: function () {
				var startFilter = "",
					endFilter = "",
					dateFilter = "",
					timeFilter = "";
				if ((this.getView().byId("INP2").getDateValue() != null || this.getView().byId("INP3").getDateValue() != null) &&
					(this.getView().byId("INP13").getDateValue() != null || this.getView().byId("INP14").getSelectedKey() != "")) {
					MessageBox.error("Başlangıç veya Bitiş Zamanında filtreleme yapabilmek için Tarih ve Vardiya alanlarını silmeniz gerekmektedir!");
					return;
				}

				if (this.getView().byId("INP2").getDateValue() != null) {
					startFilter = this.getView().byId("INP2").getDateValue().toISOString();
				}

				if (this.getView().byId("INP3").getDateValue() != null) {
					endFilter = this.getView().byId("INP3").getDateValue().toISOString();
				}

				if (this.getView().byId("INP13").getDateValue() != null) {
					dateFilter = this.getView().byId("INP13").getDateValue().toISOString();
				}

				if (this.getView().byId("INP14").getSelectedKey() != "") {
					if (this.getView().byId("INP13").getDateValue() == null) {
						MessageBox.error("Lütfen geçerli bir tarih girişi yapınız");
						return;
					} else {
						timeFilter = this.getView().byId("INP14").getSelectedKey();
					}
				}

				this.filter1 = this.getView().byId("INP1").getValue();
				this.filter2 = startFilter;
				this.filter3 = endFilter;
				this.filter4 = this.getView().byId("INP4").getSelectedKey();
				this.filter5 = this.getView().byId("INP5").getValue();
				this.filter6 = this.getView().byId("INP6").getValue();
				this.filter7 = this.getView().byId("INP7").getValue();
				this.filter8 = this.getView().byId("INP8").getValue();
				this.filter9 = this.getView().byId("INP9").getValue();
				this.filter10 = this.getView().byId("INP10").getValue();
				this.filter11 = this.getView().byId("INP11").getValue();
				this.filter12 = this.getView().byId("INP12").getValue();
				this.filter13 = dateFilter;
				this.filter14 = timeFilter;

				this.getPMNotificationDatas();
			},

			//Ekrandan Filtreleme Seçenekleri içinde Temizle Butonuna basılınca çalışan fonks.
			onClearSearchFilter: function () {
				this.getView().byId("INP1").setValue("");
				this.getView().byId("INP2").setValue(null);
				this.getView().byId("INP3").setValue(null);
				this.getView().byId("INP4").setSelectedKey("");
				this.getView().byId("INP5").setSelectedKey("");
				this.getView().byId("INP6").setSelectedKey("");
				this.getView().byId("INP7").setSelectedKey("");
				this.getView().byId("INP8").setSelectedKey("");
				this.getView().byId("INP9").setSelectedKey("");
				this.getView().byId("INP10").setSelectedKey("");
				this.getView().byId("INP11").setSelectedKey("");
				this.getView().byId("INP12").setValue("");

				var currentDate = new Date();
				this.getView().byId("INP13").setDateValue(currentDate);

				if (currentDate.getHours() < 8) {
					this.getView().byId("INP14").setSelectedKey("1");
				} else if (8 <= currentDate.getHours() && currentDate.getHours() < 16) {
					this.getView().byId("INP14").setSelectedKey("2");
				} else if (currentDate.getHours() >= 16) {
					this.getView().byId("INP14").setSelectedKey("3");
				}

				this.filter1 = "";
				this.filter2 = "";
				this.filter3 = "";
				this.filter4 = "";
				this.filter5 = "";
				this.filter6 = "";
				this.filter7 = "";
				this.filter8 = "";
				this.filter9 = "";
				this.filter10 = "";
				this.filter11 = "";
				this.filter12 = "";
				this.filter13 = this.getView().byId("INP13").getDateValue().toISOString();
				this.filter14 = this.getView().byId("INP14").getSelectedKey();

				this.getPMNotificationDatas();
			},

			getAllStoppageTypes: function () {
				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/getAllStoppageTypes/T_GET_ALL_STOPPAGE_TYPES", {},
					"O_JSON"
				);

				if (response[1] == "E") {
					MessageBox.error(response[0]);
				} else {
					var myModel = new sap.ui.model.json.JSONModel();
					if (Array.isArray(response[0]?.Rowsets?.Rowset?.Row)) {
						myModel.setData(response[0]);
					} else if (!response[0]?.Rowsets?.Rowset?.Row) {
						myModel.setData(null);
					} else {
						var obj_iv_data = response[0];
						var dummyData = [];
						dummyData.push(response[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						myModel.setData(obj_iv_data);
					}

					myModel.setSizeLimit(5000);
					this.getView().byId("INP7").setModel(myModel);
					this.getView().byId("INP8").setModel(myModel);
					this.getView().byId("INP9").setModel(myModel);
					this.getView().byId("INP10").setModel(myModel);
					this.getView().byId("INP11").setModel(myModel);
				}
			},

			//Ekrandaki tabloya verileri getiren transaction
			getPMNotificationDatas: function () {
				if (this.getView().byId("idDurusTable") == undefined) {
					oTrigger.destroy();
					return;
				}

				if (!this.transferRefresh) {
					return;
				}

				TransactionCaller.async("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/getStoppageData/T_GET_Z_NTT_TT_STOPPAGE_HEADER", {
						I_SITE: this.SITE,
						I_WORKPLACE: this.getView().byId("idWsComboBox").getSelectedKey(),
						I_FILTER1: this.filter1 || "",
						I_FILTER2: this.filter2 || "",
						I_FILTER3: this.filter3 || "",
						I_FILTER4: this.filter4 || "",
						I_FILTER5: this.filter5 || "",
						I_FILTER6: this.filter6 || "",
						I_FILTER7: this.filter7 || "",
						I_FILTER8: this.filter8 || "",
						I_FILTER9: this.filter9 || "",
						I_FILTER10: this.filter10 || "",
						I_FILTER11: this.filter11 || "",
						I_FILTER12: this.filter12 || "",
						I_FILTER13: this.filter13 || "",
						I_FILTER14: this.filter14 || "",
					},
					"O_JSON",
					this.getPMNotificationDatasCB,
					this,
					"GET"
				);
			},

			getPMNotificationDatasCB: function (iv_data, iv_scope) {
				var myModel = new sap.ui.model.json.JSONModel();
				if (iv_data[1] == "E") {
					MessageBox.error(iv_data[0]);
					iv_scope.getView().byId("idDurusTable").setModel(myModel);
					iv_scope.getView().byId("idDurusTable").getModel().refresh();
				} else {
					if (Array.isArray(iv_data[0].Rowsets?.Rowset?.Row)) {
						myModel.setData(iv_data[0]);
					} else if (!iv_data[0].Rowsets?.Rowset?.Row) {
						myModel.setData(null);
					} else {
						var obj_iv_data = iv_data[0];
						var dummyData = [];
						dummyData.push(iv_data[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						myModel.setData(obj_iv_data);
					}

					myModel.setSizeLimit(999);
					iv_scope.getView().byId("idDurusTable").setModel(myModel);
					iv_scope.colorTableRows();
					iv_scope.getView().byId("idDurusTable").getModel().refresh();
					MessageToast.show("Tablo Güncellendi");
					iv_scope.checkTransferStoppage();
				}
			},

			//Tablonun satırlarını renklendirmeye yarayan fonksiyon
			colorTableRows: function () {
				var workplace_array = ["TK2", "TK3", "TK4", "TK5", "TK6", "TK7", "TK8", "DH1", "P6", "P8", "P10", "P11", "P12", "M3", "M5", "KTM"];
				var workplace = this.getView().byId("idWsComboBox").getSelectedKey();

				//renklendirme yapılacak iş yeri kontrolü
				if (workplace_array.includes(workplace) == true) {
					var tableRowDetails = this.getView().byId("idDurusTable").getModel().oData?.Rowsets?.Rowset?.Row;
					var length = this.getView().byId("idDurusTable").getModel().oData?.Rowsets?.Rowset?.Row?.length;
					var tableItems = this.getView().byId("idDurusTable").getItems();

					for (var j = 0; j < length; j++) {
						//Öncelikle tablonun satırlarındaki classların tamamını kaldırıp temizlenir
						tableItems[j].removeStyleClass("greenBackground");
						tableItems[j].removeStyleClass("yellowBackground");
						tableItems[j].removeStyleClass("orangeBackground");
						tableItems[j].removeStyleClass("blueBackground");

						//Hız kaybı satırlarını renklendiren fonks.
						if (tableRowDetails[j].TYPE == "H") {
							tableItems[j].addStyleClass("greenBackground");
						}

						//Aktarılan otomatik/manuel duruş düzenlenip kaydedilince renklendiren fonks.
						if (tableRowDetails[j].TYPE != "H" && tableRowDetails[j].STATUS == "SAVED") {
							tableItems[j].addStyleClass("yellowBackground");
						}

						//Aktarılan hız kaybı duruşu düzenlenip kaydedilince renklendiren fonks.
						if (tableRowDetails[j].TYPE == "H" && tableRowDetails[j].STATUS == "SAVED") {
							tableItems[j].addStyleClass("orangeBackground");
						}

						//Üretim değişimi duruşu düzenlenip kaydedilince renklendiren fonks.
						if (tableRowDetails[j].FLAG == "X") {
							tableItems[j].addStyleClass("blueBackground");
						}
					}
				} else {
					var tableRowDetails = this.getView().byId("idDurusTable").getModel().oData?.Rowsets?.Rowset?.Row;
					var length = this.getView().byId("idDurusTable").getModel().oData?.Rowsets?.Rowset?.Row?.length;
					var tableItems = this.getView().byId("idDurusTable").getItems();
					
					for (var j = 0; j < length; j++) {
						//Öncelikle tablonun satırlarındaki classların tamamını kaldırıp temizlenir
						tableItems[j].removeStyleClass("greenBackground");
						tableItems[j].removeStyleClass("yellowBackground");
						tableItems[j].removeStyleClass("orangeBackground");
						tableItems[j].removeStyleClass("blueBackground");
					}
				}
			},

			//Ekran yenilendiğinde aktarılan duruş var mı yok mu kontrol eden fonks.
			checkTransferStoppage: function () {
				var oData = this.getView().byId("idDurusTable").getModel()?.getData()?.Rowsets?.Rowset?.Row;
				var length = oData?.length;

				if (length != undefined) {
					for (var i = 0; i < length; i++) {
						if (oData[i].TRANSFER_WORKPLACE == this.getView().byId("idWsComboBox").getSelectedKey()) {
							this.transferRefresh = false;
							TransferWorkplace = oData[i].WORK_CENTER;
							this.onPressStoppageEdit(undefined, i);
							break;
						}
					}
				}
			},

			//Ekranda bildirim listesi butonuna basılınca bildirim fragmentını açan fonksiyon
			onPressNotificationList: function () {
				if (this.getView().byId("idWsComboBox").getSelectedKey() == "") {
					MessageBox.error("Lütfen iş yeri seçiniz!");
					return;
				}

				if (!this.NotificationListFragment) {
					this.NotificationListFragment = sap.ui.xmlfragment("Z_NOTIFICATION_LIST", "stoppageScreen.view.fragments.notificationList",
						this);
					this.getView().addDependent(this.NotificationListFragment);
				}

				this.getPMNotifications();
				this.NotificationListFragment.open();
			},

			//Bildirim fragment içine dataları yükleyen fonksiyon
			getPMNotifications: function () {
				TransactionCaller.async("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/getNotificationData/T_GET_Z_NTT_TT_STOPPAGE_HEADER", {
						I_SITE: this.SITE,
						I_WORKPLACE: this.getView().byId("idWsComboBox").getSelectedKey()
					},
					"O_JSON",
					this.getPMNotificationsCB,
					this,
					"GET"
				);
			},

			getPMNotificationsCB: function (iv_data, iv_scope) {
				var myModel = new sap.ui.model.json.JSONModel();
				if (iv_data[1] == "E") {
					MessageBox.error(iv_data[0]);
					sap.ui.core.Fragment.byId("Z_NOTIFICATION_LIST", "idNotificaitonTable").setModel(myModel);
					sap.ui.core.Fragment.byId("Z_NOTIFICATION_LIST", "idNotificaitonTable").getModel().refresh();
				} else {
					if (Array.isArray(iv_data[0].Rowsets?.Rowset?.Row)) {
						myModel.setData(iv_data[0]);
					} else if (!iv_data[0].Rowsets?.Rowset?.Row) {
						myModel.setData(null);
					} else {
						var obj_iv_data = iv_data[0];
						var dummyData = [];
						dummyData.push(iv_data[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						myModel.setData(obj_iv_data);
					}

					myModel.setSizeLimit(999);
					sap.ui.core.Fragment.byId("Z_NOTIFICATION_LIST", "idNotificaitonTable").setModel(myModel);
					sap.ui.core.Fragment.byId("Z_NOTIFICATION_LIST", "idNotificaitonTable").getModel().refresh();
					MessageToast.show("Tablo Güncellendi");
				}
			},

			//Bildirim fragment içindeki datayı güncelleyen fonksiyon
			onPressRefreshNotifTable: function (oEvent) {
				this.getPMNotifications();
			},

			//Ekrandaki bilgileri güncelle butonuna basılınca çalışan fonksiyon
			onPressRefreshTable: function (oEvent) {
				this.getPMNotificationDatas();
			},

			//Ekrandaki iş yeri combobox seçimi değişince çalışan fonksiyon
			onSelectLine: function (oEvent) {
				this.transferRefresh = true;
				this.getFuncLocList();
				this.getAllStoppageTypes();
				this.getPMNotificationDatas();
			},

			//Başlangıç Zamanı Set
			ChangeStartDateTime: function () {
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartDate").setDateValue(new Date());
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartTime").setDateValue(new Date());
				this.calculateTimeInMinutes();
			},

			//Bitiş Zamanı Set
			ChangeEndDateTime: function () {
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndDate").setDateValue(new Date());
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndTime").setDateValue(new Date());
				this.calculateTimeInMinutes();
			},

			//Başlangıç ve Bitiş Tarih/Zamanlarının Girilmesiyle Dakika Cinsinden Sürenin Hesaplanması
			calculateTimeInMinutes: function () {
				var startDate = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartDate").getDateValue();
				var startTime = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartTime").getDateValue();

				var endDate = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndDate").getDateValue();
				var endTime = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndTime").getDateValue();

				if (startDate != null && startTime != null && endDate != null && endTime != null) {
					var getFullYear_Start = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartDate").getDateValue().getFullYear();
					var getMonth_Start = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartDate").getDateValue().getMonth();
					var getDate_Start = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartDate").getDateValue().getDate();
					var getHours_Start = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartTime").getDateValue().getHours();
					var getMinutes_Start = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartTime").getDateValue().getMinutes();
					var getSeconds_Start = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartTime").getDateValue().getSeconds();
					var combinedDateTime_Start = new Date(getFullYear_Start, getMonth_Start, getDate_Start, getHours_Start, getMinutes_Start,
						getSeconds_Start);

					var getFullYear_End = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndDate").getDateValue().getFullYear();
					var getMonth_End = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndDate").getDateValue().getMonth();
					var getDate_End = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndDate").getDateValue().getDate();
					var getHours_End = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndTime").getDateValue().getHours();
					var getMinutes_End = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndTime").getDateValue().getMinutes();
					var getSeconds_End = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndTime").getDateValue().getSeconds();
					var combinedDateTime_End = new Date(getFullYear_End, getMonth_End, getDate_End, getHours_End, getMinutes_End, getSeconds_End);

					if (combinedDateTime_End.getTime().toString() == "NaN" || combinedDateTime_Start.getTime().toString() == "NaN") {
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idTimeInMinutes").setValue("");
					} else {
						var differenceInMinutes = Math.floor((combinedDateTime_End.getTime() - combinedDateTime_Start.getTime()) / 60000);
						var differenceInSeconds = ((combinedDateTime_End.getTime() - combinedDateTime_Start.getTime()) % 60000) / 1000;
						if (differenceInMinutes == 0) {
							sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idTimeInMinutes").setValue(differenceInSeconds + " sn");
						} else {
							sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idTimeInMinutes").setValue(differenceInMinutes + " dk " + differenceInSeconds +
								" sn");
						}
					}

				} else {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idTimeInMinutes").setValue("");
				}
			},

			//Kalan Karakter Sayısı
			explanationsChange: function (oEvent) {
				var Explanations = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idExplanations").getValue().toUpperCase();

				if (Number(Explanations.length) > 132) {
					Explanations = Explanations.substring(0, 132);
				}

				var length = 132 - Number(Explanations.length);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idCharacterCounter").setText("Kalan karakter sayısı : " + length);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idExplanations").setValue(Explanations);
			},

			//Kalan Karakter Sayısı
			explanationsChange2: function (oEvent) {
				var Explanations = sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idExplanations").getValue().toUpperCase();

				if (Number(Explanations.length) > 40) {
					Explanations = Explanations.substring(0, 40);
				}

				var length = 40 - Number(Explanations.length);
				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idCharacterCounter").setText("Kalan karakter sayısı : " + length);
				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idExplanations").setValue(Explanations);
			},

			//Duruş Böl fragment içinde süre alanına değer girince çalışan fonksiyon
			onPressSplitTime: function () {
				var splitDuration = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idTimeInMinutes3").getValue() * 60;
				if (splitDuration == "") {
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndDate2").setValue(null);
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndTime2").setValue(null);
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartDate3").setValue(null);
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartTime3").setValue(null);
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idTimeInMinutes2").setValue("");
					return;
				}

				if (splitDuration <= 0) {
					MessageBox.error("Girilen süre sıfır veya negatif değer olamaz!");
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndDate2").setValue(null);
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndTime2").setValue(null);
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartDate3").setValue(null);
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartTime3").setValue(null);
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idTimeInMinutes2").setValue("");
					return;
				}

				var remainingDuration = this.originalDuration - splitDuration;
				if (remainingDuration <= 0) {
					MessageBox.error("Girilen süre, duruşun toplam süresinden büyük olamaz!");
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndDate2").setValue(null);
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndTime2").setValue(null);
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartDate3").setValue(null);
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartTime3").setValue(null);
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idTimeInMinutes2").setValue("");
					return;
				}

				var StartDate2 = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartDate2").getDateValue();
				var StartTime2 = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartTime2").getDateValue();
				var getFullYear_Start2 = StartDate2.getFullYear();
				var getMonth_Start2 = StartDate2.getMonth();
				var getDate_Start2 = StartDate2.getDate();
				var getHours_Start2 = StartTime2.getHours();
				var getMinutes_Start2 = StartTime2.getMinutes();
				var getSeconds_Start2 = StartTime2.getSeconds();
				var combinedDateTime_Start2 = new Date(getFullYear_Start2, getMonth_Start2, getDate_Start2, getHours_Start2, getMinutes_Start2,
					getSeconds_Start2).getTime();

				var EndDate3 = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndDate3").getDateValue();
				var EndTime3 = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndTime3").getDateValue();
				var getFullYear_End3 = EndDate3.getFullYear();
				var getMonth_End3 = EndDate3.getMonth();
				var getDate_End3 = EndDate3.getDate();
				var getHours_End3 = EndTime3.getHours();
				var getMinutes_End3 = EndTime3.getMinutes();
				var getSeconds_End3 = EndTime3.getSeconds();
				var combinedDateTime_End3 = new Date(getFullYear_End3, getMonth_End3, getDate_End3, getHours_End3, getMinutes_End3, getSeconds_End3)
					.getTime();

				var splitTime1 = combinedDateTime_End3 - splitDuration * 1000;
				sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartDate3").setDateValue(new Date(splitTime1));
				sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartTime3").setDateValue(new Date(splitTime1));

				var splitTime2 = combinedDateTime_Start2 + remainingDuration * 1000;
				sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndDate2").setDateValue(new Date(splitTime2));
				sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndTime2").setDateValue(new Date(splitTime2));

				var differenceInMinutes = Math.floor(remainingDuration / 60);
				var differenceInSeconds = remainingDuration % 60;
				sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idTimeInMinutes2").setValue(differenceInMinutes + " dk " + differenceInSeconds +
					" sn");
			},

			//Ekrandan yeni bildirim yarat butonuna basılınca çalışan fonksiyon
			onPressCreateNotification: function () {
				mode = "createNotification";

				if (this.getView().byId("idWsComboBox").getSelectedKey() == "") {
					MessageBox.error("Lütfen iş yeri seçiniz!");
					return;
				}

				if (!this.createNotification) {
					this.createNotification = sap.ui.xmlfragment("Z_CREATE_NOTIFICATION", "stoppageScreen.view.fragments.createNotification",
						this);
					this.getView().addDependent(this.createNotification);
				}

				this.getFuncLocList();
				this.getCatalogCodes();
				this.getCodeGroups();
				this.getAllPMWorkplaces();
				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "FUNC_LOC").setSelectedKey("");

				var myModel = new sap.ui.model.json.JSONModel();
				myModel.setData(null);

				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "TOOL").setModel(myModel);
				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "TOOL").getModel().refresh();
				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "TOOL").setSelectedKey("");

				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idPMNotificationType").setSelectedKey("");
				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idCatalogCode").setSelectedKey("");
				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idCodeGroup").setSelectedKey("");
				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idPMWorkplace").setSelectedKey("");
				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idExplanations").setValue("");
				this.explanationsChange2();

				this.createNotification.open();
			},

			//Ekrandan yeni duruş yarat butonuna basılınca çalışan fonksiyon
			onPressCreateStoppage: function (oEvent) {
				mode = "createStoppage";

				if (this.getView().byId("idWsComboBox").getSelectedKey() == "") {
					MessageBox.error("Lütfen iş yeri seçiniz!");
					return;
				}

				if (!this.createNotificationFragment) {
					this.createNotificationFragment = sap.ui.xmlfragment("Z_CREATE_DOWNTIME", "stoppageScreen.view.fragments.createAndUpdateStoppages",
						this);
					this.getView().addDependent(this.createNotificationFragment);
				}

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartDate").setEnabled(true);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartTime").setEnabled(true);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idChangeStartDateTime").setEnabled(true);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndDate").setEnabled(true);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndTime").setEnabled(true);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idChangeEndDateTime").setEnabled(true);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idCancelDownTimeButton").setEnabled(true);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idRejectStoppageButton").setVisible(false);

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartDate").setValue(null);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartTime").setValue(null);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndDate").setValue(null);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndTime").setValue(null);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idTimeInMinutes").setValue("");

				this.getFuncLocList();
				this.getAllPMWorkplaces();
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "FUNC_LOC").setSelectedKey("");

				var myModel = new sap.ui.model.json.JSONModel();
				myModel.setData(null);

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "TOOL").setModel(myModel);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "TOOL").getModel().refresh();
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "TOOL").setSelectedKey("");

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE1").setModel(myModel);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE1").getModel().refresh();
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE1").setSelectedKey("");

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE2").setModel(myModel);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE2").getModel().refresh();
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE2").setSelectedKey("");

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").setModel(myModel);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").getModel().refresh();
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").setSelectedKey("");

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").setModel(myModel);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").getModel().refresh();
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").setSelectedKey("");

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").setModel(myModel);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").getModel().refresh();
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").setSelectedKey("");

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMNotificationType").setSelectedKey("");

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMWorkplace").setSelectedKey("");

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idNotification").setEnabled(true);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idNotification").setSelected(false);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idExplanations").setValue("");
				this.explanationsChange();
				updateIndex = "";

				this.createNotificationFragment.setTitle("Yeni Duruş Yarat");
				this.createNotificationFragment.open();
			},

			//Ekrandan duruş düzenle butonuna basılınca çalışan fonksiyon
			onPressStoppageEdit: function (oEvent, selectedIndex) {
				mode = "editStoppage";

				if (this.getView().byId("idWsComboBox").getSelectedKey() == "") {
					MessageBox.error("Lütfen iş yeri seçiniz!");
					return;
				}

				if (oEvent != undefined) {
					var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
					//Üretim değişimi butonuna basılırsa Flag X, Duruş düzenle butonuna basılırsa Flag boş 
					if (oEvent.oSource.getId().includes("idProdChange") == true) {
						flag = "X";
					} else {
						flag = "";
					}
				} else {
					//Duruş Aktar ile açılan otomatik fragment için Flag boş
					var selectedIndex = selectedIndex;
					flag = "";
				}

				var oTableData = this.getView().byId("idDurusTable").getModel().getData().Rowsets.Rowset.Row;
				var selectedRow = oTableData[selectedIndex];

				//Üretim değişimi yapılan bir duruşa tekrar üretim değişimi yapılmak istenince hata veren kod bloğu
				if (oEvent != undefined) {
					if (oEvent.oSource.getId().includes("idProdChange") == true && selectedRow.FLAG == "X") {
						MessageBox.error("Bu duruş için daha önce Üretim Değişimi işlemi yapılmıştır!");
						flag = "";
						return;
					}
				}

				if (!this.createNotificationFragment) {
					this.createNotificationFragment = sap.ui.xmlfragment("Z_CREATE_DOWNTIME", "stoppageScreen.view.fragments.createAndUpdateStoppages",
						this);
					this.getView().addDependent(this.createNotificationFragment);
				}

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartDate").setDateValue(new Date(selectedRow.START_TIME));
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartTime").setDateValue(new Date(selectedRow.START_TIME));

				if (selectedRow.END_TIME == "TimeUnavailable") {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndDate").setValue(null);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndTime").setValue(null);
				} else {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndDate").setDateValue(new Date(selectedRow.END_TIME));
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndTime").setDateValue(new Date(selectedRow.END_TIME));
				}

				this.calculateTimeInMinutes();

				if (oEvent != undefined) {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartDate").setEnabled(true);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartTime").setEnabled(true);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idChangeStartDateTime").setEnabled(true);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndDate").setEnabled(true);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndTime").setEnabled(true);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idChangeEndDateTime").setEnabled(true);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idCancelDownTimeButton").setEnabled(true);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idRejectStoppageButton").setVisible(false);
				} else {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartDate").setEnabled(false);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartTime").setEnabled(false);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idChangeStartDateTime").setEnabled(false);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndDate").setEnabled(false);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndTime").setEnabled(false);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idChangeEndDateTime").setEnabled(false);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idCancelDownTimeButton").setEnabled(false);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idRejectStoppageButton").setVisible(true);
				}

				this.getFuncLocList();
				this.getAllPMWorkplaces();
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "FUNC_LOC").setSelectedKey(selectedRow.FUNC_LOC);

				this.onChangeComboBox(undefined, "FUNC_LOC", selectedRow.FUNC_LOC);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "TOOL").setSelectedKey(selectedRow.TOOL);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE1").setSelectedKey(selectedRow.REASON_CODE1);

				this.onChangeComboBox(undefined, "REASON_CODE1", selectedRow.REASON_CODE1);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE2").setSelectedKey(selectedRow.REASON_CODE2);

				this.onChangeComboBox(undefined, "REASON_CODE2", selectedRow.REASON_CODE2);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").setSelectedKey(selectedRow.REASON_CODE3);

				this.onChangeComboBox(undefined, "REASON_CODE3", selectedRow.REASON_CODE3);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").setSelectedKey(selectedRow.REASON_CODE4);

				this.onChangeComboBox(undefined, "REASON_CODE4", selectedRow.REASON_CODE4);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").setSelectedKey(selectedRow.REASON_CODE5);

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMNotificationType").setSelectedKey(selectedRow.NOTIF_TYPE);

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMWorkplace").setSelectedKey(selectedRow.RESP_WORK_CENTER);

				if (selectedRow.CONVERT_NOTIFICATION == 1) {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idNotification").setSelected(true);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idNotification").setEnabled(false);
				} else {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idNotification").setSelected(false);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idNotification").setEnabled(true);
				}

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idExplanations").setValue(selectedRow.COMMENT);
				this.explanationsChange();

				updateIndex = selectedRow.ID;
				if (selectedRow.NOTIF_ID == null) {
					this.createNotificationFragment.setTitle("Duruş Düzenle");
				} else {
					this.createNotificationFragment.setTitle("Duruş Düzenle " + "(" + selectedRow.NOTIF_ID + ")");
				}

				this.createNotificationFragment.open();
			},

			//Ekrandan yeni duruş sil butonuna basılınca çalışan fonksiyon
			onPressStoppageDelete: function (oEvent) {
				var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
				var oTableData = this.getView().byId("idDurusTable").getModel().getData().Rowsets.Rowset.Row;
				var selectedRow = oTableData[selectedIndex];

				//Duruşu silen diyalog ve Onayla butonuna basılınca çalışan fonksiyon
				MessageBox.warning("İlgili duruş bilgileri sistemden silinecektir.\r\n\r\nOnaylıyor musunuz?", {
					actions: ["Onayla", "İptal"],
					emphasizedAction: "Onayla",
					onClose: function (sAction) {
						if (sAction == "Onayla") {
							var response = TransactionCaller.sync(
								"ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/deleteStoppage/T_DEL_Z_NTT_TT_STOPPAGE_HEADER", {
									I_ID: selectedRow.ID,
									I_SITE: that.SITE
								},
								"O_JSON"
							);

							if (response[1] == "E") {
								MessageBox.error(response[0]);
							} else {
								MessageBox.information(response[0]);
								that.getPMNotificationDatas();
							}
						}
					},
				});
			},

			//Ekrandan duruş aktar butonuna basılınca çalışan fonksiyon
			onPressStoppageTransfer: function (oEvent) {
				var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
				var oTableData = this.getView().byId("idDurusTable").getModel().getData().Rowsets.Rowset.Row;
				var selectedRow = oTableData[selectedIndex];

				if (selectedRow.FLAG == "X") {
					MessageBox.error("Üretim Değişimi yapılan bir duruşu aktaramazsınız!");
					return;
				}

				if (!this.transferStoppageFragment) {
					this.transferStoppageFragment = sap.ui.xmlfragment("Z_TRANSFER_DOWNTIME", "stoppageScreen.view.fragments.stoppageTransfer",
						this);
					this.getView().addDependent(this.transferStoppageFragment);
				}

				var currentWorkplace = this.getView().byId("idWsComboBox").getSelectedKey();
				sap.ui.core.Fragment.byId("Z_TRANSFER_DOWNTIME", "idCurrentWorkplace").setValue(currentWorkplace);

				this.getAllLines();
				sap.ui.core.Fragment.byId("Z_TRANSFER_DOWNTIME", "idTransferWorkplace").setSelectedKey("");

				transferIndex = selectedRow.ID;
				this.transferStoppageFragment.open();
			},

			//Ekrandan duruş böl butonuna basılınca çalışan fonksiyon
			onPressStoppageSplit: function (oEvent) {
				var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
				var oTableData = this.getView().byId("idDurusTable").getModel().getData().Rowsets.Rowset.Row;
				var selectedRow = oTableData[selectedIndex];

				if (!this.splitStoppageFragment) {
					this.splitStoppageFragment = sap.ui.xmlfragment("Z_SPLIT_DOWNTIME", "stoppageScreen.view.fragments.divideStoppage",
						this);
					this.getView().addDependent(this.splitStoppageFragment);
				}

				sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartDate2").setDateValue(new Date(selectedRow.START_TIME));
				sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartTime2").setDateValue(new Date(selectedRow.START_TIME));

				if (selectedRow.END_TIME == "TimeUnavailable") {
					MessageBox.error("Bitiş zamanı olmayan duruşlarda bölme işlemi yapılamaz!");
					return;
				} else {
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndDate3").setDateValue(new Date(selectedRow.END_TIME));
					sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndTime3").setDateValue(new Date(selectedRow.END_TIME));
				}
				sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idTimeInMinutes3").setValue("");
				this.onPressSplitTime();

				splitIndex = selectedRow.ID;
				this.originalDuration = selectedRow.DURATION;
				this.splitStoppageFragment.open();
			},

			//Fragment açılınca Teknik Birim kısmına modeli basan fonksiyon
			getFuncLocList: function () {
				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/findFunctionalLocation/T_SlcFunctionalLocation", {
						I_SITE: this.SITE,
						I_WORKPLACE: this.getView().byId("idWsComboBox").getSelectedKey(),
					},
					"O_JSON"
				);

				var myModel = new sap.ui.model.json.JSONModel();
				if (Array.isArray(response[0]?.Rowsets?.Rowset?.Row)) {
					myModel.setData(response[0]);
				} else if (!response[0]?.Rowsets?.Rowset?.Row) {
					myModel.setData(null);
				} else {
					var obj_iv_data = response[0];
					var dummyData = [];
					dummyData.push(response[0].Rowsets.Rowset.Row);
					obj_iv_data.Rowsets.Rowset.Row = dummyData;
					myModel.setData(obj_iv_data);
				}
				myModel.setSizeLimit(999);
				if (mode == "createStoppage" || mode == "editStoppage") {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "FUNC_LOC").setModel(myModel);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "FUNC_LOC").getModel().refresh();
				}

				if (mode == "createNotification") {
					sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "FUNC_LOC").setModel(myModel);
					sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "FUNC_LOC").getModel().refresh();
				}

				this.getView().byId("INP5").setModel(myModel);
				this.getView().byId("INP5").getModel().refresh();
			},

			//Bildirim oluştur fragment içinde katalog kodlarını çeken fonks.
			getCatalogCodes: function () {
				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/getCatalogCodes/T_GetCatalogCodes", {},
					"O_JSON"
				);

				var myModel = new sap.ui.model.json.JSONModel();
				if (Array.isArray(response[0]?.Rowsets?.Rowset?.Row)) {
					myModel.setData(response[0]);
				} else if (!response[0]?.Rowsets?.Rowset?.Row) {
					myModel.setData(null);
				} else {
					var obj_iv_data = response[0];
					var dummyData = [];
					dummyData.push(response[0].Rowsets.Rowset.Row);
					obj_iv_data.Rowsets.Rowset.Row = dummyData;
					myModel.setData(obj_iv_data);
				}

				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idCatalogCode").setModel(myModel);
				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idCatalogCode").getModel().refresh();
			},

			//Bildirim oluştur fragment içinde kod gruplarını çeken fonks.
			getCodeGroups: function () {
				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/getCodeGroups/T_GetCodeGroups", {},
					"O_JSON"
				);

				var myModel = new sap.ui.model.json.JSONModel();
				if (Array.isArray(response[0]?.Rowsets?.Rowset?.Row)) {
					myModel.setData(response[0]);
				} else if (!response[0]?.Rowsets?.Rowset?.Row) {
					myModel.setData(null);
				} else {
					var obj_iv_data = response[0];
					var dummyData = [];
					dummyData.push(response[0].Rowsets.Rowset.Row);
					obj_iv_data.Rowsets.Rowset.Row = dummyData;
					myModel.setData(obj_iv_data);
				}

				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idCodeGroup").setModel(myModel);
				sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idCodeGroup").getModel().refresh();
			},

			//Fragment açılınca Sorumlu İş yeri kısmına modeli basan fonksiyon
			getAllPMWorkplaces: function () {
				if (mode == "createStoppage" || mode == "editStoppage") {
					var location = this.getView().byId("idWsComboBox").getSelectedKey();
				}

				if (mode == "createNotification") {
					var location = "";
				}

				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/getAllPMWorkplaces/T_GetAllPMWorkplaces", {
						I_SITE: this.SITE,
						I_LOCATION: location
					},
					"O_JSON"
				);

				var myModel = new sap.ui.model.json.JSONModel();
				if (Array.isArray(response[0]?.Rowsets?.Rowset?.Row)) {
					myModel.setData(response[0]);
				} else if (!response[0]?.Rowsets?.Rowset?.Row) {
					myModel.setData(null);
				} else {
					var obj_iv_data = response[0];
					var dummyData = [];
					dummyData.push(response[0].Rowsets.Rowset.Row);
					obj_iv_data.Rowsets.Rowset.Row = dummyData;
					myModel.setData(obj_iv_data);
				}
				myModel.setSizeLimit(999);
				if (mode == "createStoppage" || mode == "editStoppage") {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMWorkplace").setModel(myModel);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMWorkplace").getModel().refresh();
				}

				if (mode == "createNotification") {
					sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idPMWorkplace").setModel(myModel);
					sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idPMWorkplace").getModel().refresh();
				}
			},

			//Fragment içindeki Lokasyon ve Reason Code alanları değişince çalışan fonksiyon
			onChangeComboBox: function (oEvent, Parameter, Value) {
				if (oEvent != undefined) {
					var selectedParameter = oEvent.getSource().getId().split("--")[1];
				} else {
					var selectedParameter = Parameter;
				}

				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(null);

				if (selectedParameter == "FUNC_LOC") {
					if (mode == "createStoppage" || mode == "editStoppage") {
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "TOOL").setModel(oModel);
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "TOOL").getModel().refresh();
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE1").setModel(oModel);
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE1").getModel().refresh();
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE2").setModel(oModel);
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE2").getModel().refresh();
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").setModel(oModel);
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").getModel().refresh();
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").setModel(oModel);
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").getModel().refresh();
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").setModel(oModel);
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").getModel().refresh();

						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "TOOL").setSelectedKey("");
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE1").setSelectedKey("");
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE2").setSelectedKey("");
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").setSelectedKey("");
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").setSelectedKey("");
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").setSelectedKey("");

						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMNotificationType").setSelectedKey("");
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMWorkplace").setSelectedKey("");
					}

					if (mode == "createNotification") {
						sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "TOOL").setModel(oModel);
						sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "TOOL").setSelectedKey("");
					}
				} else if (selectedParameter == "REASON_CODE1") {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE2").setModel(oModel);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE2").getModel().refresh();
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").setModel(oModel);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").getModel().refresh();
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").setModel(oModel);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").getModel().refresh();
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").setModel(oModel);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").getModel().refresh();

					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE2").setSelectedKey("");
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").setSelectedKey("");
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").setSelectedKey("");
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").setSelectedKey("");

					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMNotificationType").setSelectedKey("");
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMWorkplace").setSelectedKey("");
				} else if (selectedParameter == "REASON_CODE2") {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").setModel(oModel);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").getModel().refresh();
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").setModel(oModel);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").getModel().refresh();
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").setModel(oModel);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").getModel().refresh();

					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").setSelectedKey("");
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").setSelectedKey("");
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").setSelectedKey("");
				} else if (selectedParameter == "REASON_CODE3") {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").setModel(oModel);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").getModel().refresh();
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").setModel(oModel);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").getModel().refresh();

					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").setSelectedKey("");
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").setSelectedKey("");
				} else if (selectedParameter == "REASON_CODE4") {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").setModel(oModel);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").getModel().refresh();

					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").setSelectedKey("");
				}

				if (selectedParameter == "FUNC_LOC") {
					this.getEquipments("");
				}

				if (selectedParameter == "-View1") {
					this.getEquipments(this.getView().byId("INP5").getSelectedKey());
				}

				if (selectedParameter == "REASON_CODE1") {
					this.getPMWorkplace();
				}

				if (mode == "createStoppage" || mode == "editStoppage") {
					var workplace = this.getView().byId("idWsComboBox").getSelectedKey();
					var location = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "FUNC_LOC").getSelectedKey();
					var reasonCode1 = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE1").getSelectedKey();
					var reasonCode2 = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE2").getSelectedKey();
					var reasonCode3 = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").getSelectedKey();
					var reasonCode4 = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").getSelectedKey();

					//Teknik Birim veya Reason Code seçilince alt reason codeları çeken fonks.
					var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/stoppageScreen/getReasonCodes/T_GetReasonCodes", {
							I_LOCATION: location,
							I_REASON_CODE1: reasonCode1,
							I_REASON_CODE2: reasonCode2,
							I_REASON_CODE3: reasonCode3,
							I_REASON_CODE4: reasonCode4,
							I_PARAMETER: selectedParameter,
							I_WORK_CENTER: workplace,
						},
						"O_JSON"
					);

					var myModel = new sap.ui.model.json.JSONModel();
					if (Array.isArray(response[0]?.Rowsets?.Rowset?.Row)) {
						myModel.setData(response[0]);
					} else if (!response[0]?.Rowsets?.Rowset?.Row) {
						myModel.setData(null);
					} else {
						var obj_iv_data = response[0];
						var dummyData = [];
						dummyData.push(response[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						myModel.setData(obj_iv_data);
					}

					myModel.setSizeLimit(999);
					if (selectedParameter == "FUNC_LOC") {
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE1").setModel(myModel);
						sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE1").getModel().refresh();
					} else {
						var identityNumber = Number(selectedParameter.charAt(selectedParameter.length - 1)) + 1;
						if (identityNumber <= 5) {
							var tempVar = "REASON_CODE" + identityNumber;
							sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", tempVar).setModel(myModel);
							sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", tempVar).getModel().refresh();
						}
					}
				}
			},

			//Teknik birim seçilince ilgili ekipmanları getiren fonksiyon
			getEquipments: function (Location) {
				if (mode == "createStoppage" || mode == "editStoppage") {
					var location = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "FUNC_LOC").getSelectedKey();
				}

				if (mode == "createNotification") {
					var location = sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "FUNC_LOC").getSelectedKey();
				}

				if (Location != "") {
					var location = Location;
				}

				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/findToolNumber/T_SlcToolNumberList", {
						I_SITE: this.SITE,
						I_WORKPLACE: this.getView().byId("idWsComboBox").getSelectedKey(),
						I_LOCATION: location,
					},
					"O_JSON"
				);

				var myModel = new sap.ui.model.json.JSONModel();
				if (Array.isArray(response[0]?.Rowsets?.Rowset?.Row)) {
					myModel.setData(response[0]);
				} else if (!response[0]?.Rowsets?.Rowset?.Row) {
					myModel.setData(null);
				} else {
					var obj_iv_data = response[0];
					var dummyData = [];
					dummyData.push(response[0].Rowsets.Rowset.Row);
					obj_iv_data.Rowsets.Rowset.Row = dummyData;
					myModel.setData(obj_iv_data);
				}

				myModel.setSizeLimit(999);
				if (mode == "createStoppage" || mode == "editStoppage") {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "TOOL").setModel(myModel);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "TOOL").getModel().refresh();
				}

				if (mode == "createNotification") {
					sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "TOOL").setModel(myModel);
					sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "TOOL").getModel().refresh();
				}

				if (Location != "") {
					this.getView().byId("INP6").setModel(myModel);
					this.getView().byId("INP6").getModel().refresh();
				}
			},

			//Duruş Tipi 1 seçilinde PM İş Yeri kısmına modeli basan fonksiyon
			getPMWorkplace: function () {
				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/getPMWorkplaces/T_GetPMWorkplaces", {
						I_REASON_CODE1: sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE1").getSelectedKey(),
						I_SITE: this.SITE,
						I_LOCATION: sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "FUNC_LOC").getSelectedKey()
					},
					"O_JSON"
				);

				var myModel = new sap.ui.model.json.JSONModel();
				if (Array.isArray(response[0]?.Rowsets?.Rowset?.Row)) {
					myModel.setData(response[0]);
				} else if (!response[0]?.Rowsets?.Rowset?.Row) {
					myModel.setData(null);
				} else {
					var obj_iv_data = response[0];
					var dummyData = [];
					dummyData.push(response[0].Rowsets.Rowset.Row);
					obj_iv_data.Rowsets.Rowset.Row = dummyData;
					myModel.setData(obj_iv_data);
				}

				var selectedPMWorkplace = myModel.getData()?.Rowsets?.Rowset?.Row[0]?.WORKPLACE_ID;
				var selectedStoppageType = myModel.getData()?.Rowsets?.Rowset?.Row[0]?.REASON_TYPE;

				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMWorkplace").setSelectedKey(selectedPMWorkplace);
				sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMNotificationType").setSelectedKey(selectedStoppageType);

				if (selectedPMWorkplace != null && selectedStoppageType != null) {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idNotification").setSelected(true);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idNotification").setEnabled(false);
				} else {
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idNotification").setSelected(false);
					sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idNotification").setEnabled(true);
				}
			},

			//Fragment içindeki kaydet butonuna basınca çalışan INSERT veya UPDATE komutları
			onPressCreateDownTimeButton: function (oEvent) {
				//ÜRETİM YERİ KONTROLÜ
				if (this.SITE == "" || this.SITE == null) {
					MessageBox.error("Üretim Yeri bilgisi bulunamadı!");
					return;
				}

				//İŞ YERİ KONTROLÜ
				var workcenter = this.getView().byId("idWsComboBox").getSelectedKey();
				if (workcenter == "" || workcenter == null) {
					MessageBox.error("İş Yeri bilgisi bulunamadı!");
					return;
				}

				if (mode == "createStoppage" || mode == "editStoppage") {
					//BAŞLANGIÇ ZAMANI KONTROLÜ
					var StartDate = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartDate").getDateValue();
					var StartTime = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idStartTime").getDateValue();
					if (StartDate == null) {
						MessageBox.error("Başlangıç Tarihi alanı boş bırakılamaz!");
						return;
					}
					if (StartTime == null) {
						MessageBox.error("Başlangıç Zamanı alanı boş bırakılamaz!");
						return;
					}
					var getFullYear_Start = StartDate.getFullYear();
					var getMonth_Start = StartDate.getMonth();
					var getDate_Start = StartDate.getDate();
					var getHours_Start = StartTime.getHours();
					var getMinutes_Start = StartTime.getMinutes();
					var getSeconds_Start = StartTime.getSeconds();
					var combinedDateTime_Start = new Date(getFullYear_Start, getMonth_Start, getDate_Start, getHours_Start, getMinutes_Start,
						getSeconds_Start);
					if (new Date().getTime() - combinedDateTime_Start.getTime() < 0) {
						MessageBox.error("Başlangıç zamanı gelecek zamanda olamaz!");
						return;
					}

					//BİTİŞ ZAMANI KONTROLÜ
					var EndDate = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndDate").getDateValue();
					var EndTime = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idEndTime").getDateValue();
					if (EndDate == null && EndTime != null) {
						MessageBox.error("Bitiş Tarihi alanı boş bırakılamaz!");
						return;
					}
					if (EndDate != null && EndTime == null) {
						MessageBox.error("Bitiş Zamanı alanı boş bırakılamaz!");
						return;
					}
					if (EndDate != null && EndTime != null) {
						var getFullYear_End = EndDate.getFullYear();
						var getMonth_End = EndDate.getMonth();
						var getDate_End = EndDate.getDate();
						var getHours_End = EndTime.getHours();
						var getMinutes_End = EndTime.getMinutes();
						var getSeconds_End = EndTime.getSeconds();
						var combinedDateTime_End = new Date(getFullYear_End, getMonth_End, getDate_End, getHours_End, getMinutes_End, getSeconds_End);
						if (new Date().getTime() - combinedDateTime_End.getTime() < 0) {
							MessageBox.error("Bitiş zamanı gelecek zamanda olamaz!");
							return;
						}

						if (combinedDateTime_End.getTime() - combinedDateTime_Start.getTime() == 0) {
							MessageBox.error("Bitiş zamanı, başlangıç zamanı ile aynı olamaz!");
							return;
						}

						if (combinedDateTime_End.getTime() - combinedDateTime_Start.getTime() < 0) {
							MessageBox.error("Bitiş zamanı, başlangıç zamanından erken olamaz!");
							return;
						}
					}

					//PM BİLDİRİMİ
					var notification = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idNotification").getSelected();

					//LOKASYON KONTROLÜ
					var location = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "FUNC_LOC").getSelectedKey();
					if (location == "") {
						MessageBox.error("Lokasyon alanı boş bırakılamaz!");
						return;
					}

					//EKİPMAN KONTROLÜ
					var equipment = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "TOOL").getSelectedKey();
					if (notification == true) {
						if (equipment == "") {
							MessageBox.error("Ekipman alanı boş bırakılamaz!");
							return;
						}
					}

					//DURUŞ TİPİ KONTROLÜ
					var reasonCode1 = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE1").getSelectedKey();
					if (reasonCode1 == "") {
						MessageBox.error("Duruş Tipi 1 için en az 1 geçerli duruş tipi girmeniz gerekmektedir!");
						return;
					}

					if (flag == "X" && reasonCode1 != "uretim_degisimi") {
						MessageBox.error("Duruş Tipi 1, üretim değişimi için uygun değildir!");
						return;
					}

					var reasonCode2 = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE2").getSelectedKey();
					if (reasonCode2 == "" && sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE2").getModel()?.getData()?.Rowsets?.Rowset?.Row != undefined) {
						MessageBox.error("Duruş Tipi 2 için en az 1 geçerli duruş tipi girmeniz gerekmektedir!");
						return;
					}

					var reasonCode3 = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").getSelectedKey();
					if (reasonCode3 == "" && sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE3").getModel()?.getData()?.Rowsets?.Rowset?.Row != undefined) {
						MessageBox.error("Duruş Tipi 3 için en az 1 geçerli duruş tipi girmeniz gerekmektedir!");
						return;
					}

					var reasonCode4 = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").getSelectedKey();
					if (reasonCode4 == "" && sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE4").getModel()?.getData()?.Rowsets?.Rowset?.Row != undefined) {
						MessageBox.error("Duruş Tipi 4 için en az 1 geçerli duruş tipi girmeniz gerekmektedir!");
						return;
					}

					var reasonCode5 = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").getSelectedKey();
					if (reasonCode5 == "" && sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "REASON_CODE5").getModel()?.getData()?.Rowsets?.Rowset?.Row != undefined) {
						MessageBox.error("Duruş Tipi 5 için en az 1 geçerli duruş tipi girmeniz gerekmektedir!");
						return;
					}

					//DURUŞ TÜRÜ KONTROLÜ
					var stoppageType = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMNotificationType").getSelectedKey();
					if (notification == true) {
						if (stoppageType == "") {
							MessageBox.error("Duruş Türü alanı boş bırakılamaz!");
							return;
						}
					}

					//SORUMLU İŞ YERİ KONTROLÜ
					var resp_workplace = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idPMWorkplace").getSelectedKey();
					if (notification == true) {
						if (resp_workplace == "") {
							MessageBox.error("Sorumlu İş Yeri alanı boş bırakılamaz!");
							return;
						}
					}

					//AÇIKLAMA ALANI KONTROLÜ
					var explanations = sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idExplanations").getValue();
					if (notification == true) {
						if (explanations == "") {
							MessageBox.error("Açıklama alanı boş bırakılamaz!");
							return;
						}
					}

					//AÇIKLAMA ALANI KARAKTER KONTROLÜ
					if (explanations.length > 132) {
						MessageBox.error("Açıklama metni 132 karakterden fazla olamaz!");
						return;
					}
				}

				if (mode == "createNotification") {
					//PM BİLDİRİMİ
					var notification = sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idNotification").getSelected();

					//LOKASYON KONTROLÜ
					var location = sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "FUNC_LOC").getSelectedKey();
					if (location == "") {
						MessageBox.error("Lokasyon alanı boş bırakılamaz!");
						return;
					}

					//EKİPMAN KONTROLÜ
					var equipment = sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "TOOL").getSelectedKey();
					if (equipment == "") {
						MessageBox.error("Ekipman alanı boş bırakılamaz!");
						return;
					}

					var reasonCode1 = "";
					var reasonCode2 = "";
					var reasonCode3 = "";
					var reasonCode4 = "";
					var reasonCode5 = "";

					//DURUŞ TÜRÜ KONTROLÜ
					var stoppageType = sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idPMNotificationType").getSelectedKey();
					if (stoppageType == "") {
						MessageBox.error("Duruş Türü alanı boş bırakılamaz!");
						return;
					}

					//KATALOG KODU KONTROLÜ
					var catalogCode = sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idCatalogCode").getSelectedKey();
					if (catalogCode == "") {
						MessageBox.error("Katalog Kodu alanı boş bırakılamaz!");
						return;
					}

					//KOD GRUBU KONTROLÜ
					var codeGroup = sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idCodeGroup").getSelectedKey();
					if (codeGroup == "") {
						MessageBox.error("Kod Grubu alanı boş bırakılamaz!");
						return;
					}

					//SORUMLU İŞ YERİ KONTROLÜ
					var resp_workplace = sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idPMWorkplace").getSelectedKey();
					if (resp_workplace == "") {
						MessageBox.error("Sorumlu İş Yeri alanı boş bırakılamaz!");
						return;
					}

					//AÇIKLAMA ALANI KONTROLÜ
					var explanations = sap.ui.core.Fragment.byId("Z_CREATE_NOTIFICATION", "idExplanations").getValue();
					if (explanations == "") {
						MessageBox.error("Açıklama alanı boş bırakılamaz!");
						return;
					}

					//AÇIKLAMA ALANI KARAKTER KONTROLÜ
					if (explanations.length > 40) {
						MessageBox.error("Açıklama metni 40 karakterden fazla olamaz!");
						return;
					}
				}

				//ZAMANLARIN ISO STANDARDINA DÖNÜŞTÜRÜLMESİ
				if (combinedDateTime_Start == undefined) {
					combinedDateTime_Start = "";
				} else {
					combinedDateTime_Start = combinedDateTime_Start.toISOString();
				}

				if (combinedDateTime_End == undefined) {
					combinedDateTime_End = "";
				} else {
					combinedDateTime_End = combinedDateTime_End.toISOString();
				}

				if (mode == "createStoppage" || mode == "editStoppage") {
					var type = "M";
				} else if (mode == "createNotification") {
					var type = "B";
				}

				//MANUEL DURUŞ OLUŞTURURKEN VEYA MEVCUT BİR DURUŞU GÜNCELLERKEN BAŞKA DURUŞLA ÇAKIŞMA KONTROLÜ
				if (mode == "createStoppage" || mode == "editStoppage") {
					if (this.transferRefresh == true) {
						var transferWorkplace = this.getView().byId("idWsComboBox").getSelectedKey();
					} else {
						var transferWorkplace = TransferWorkplace;
					}

					var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/checkStoppage/T_checkStoppage", {
							I_ID: updateIndex,
							I_SITE: this.SITE,
							I_WORK_CENTER: transferWorkplace,
							I_START_TIMESTAMP: combinedDateTime_Start,
							I_END_TIMESTAMP: combinedDateTime_End
						},
						"O_JSON"
					);

					if (response[1] == "E") {
						MessageBox.error(response[0]);
						return;
					}
				}

				if (mode == "createStoppage" || mode == "createNotification") {
					//INSERT KOMUTU
					TransactionCaller.async("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/createStoppage/T_INS_Z_NTT_TT_STOPPAGE_HEADER", {
							I_START_TIMESTAMP: combinedDateTime_Start,
							I_END_TIMESTAMP: combinedDateTime_End,
							I_LOCATION: location,
							I_EQUIPMENT: equipment,
							I_REASON_CODE1: reasonCode1,
							I_REASON_CODE2: reasonCode2,
							I_REASON_CODE3: reasonCode3,
							I_REASON_CODE4: reasonCode4,
							I_REASON_CODE5: reasonCode5,
							I_STOPPAGE_TYPE: stoppageType,
							I_WORK_CENTER: workcenter,
							I_CREATE_NOTIFICATION: notification,
							I_EXPLANATIONS: explanations,
							I_SITE: this.SITE,
							I_RESP_WORK_CENTER: resp_workplace,
							I_TYPE: type,
							I_CATALOG_CODE: catalogCode,
							I_CODE_GROUP: codeGroup
						},
						"O_JSON",
						this.onPressCreateUpdateDownTimeButtonCB,
						this
					);
				} else {
					//UPDATE KOMUTU
					TransactionCaller.async("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/updateStoppage/T_UPD_Z_NTT_TT_STOPPAGE_HEADER", {
							I_ID: updateIndex,
							I_START_TIMESTAMP: combinedDateTime_Start,
							I_END_TIMESTAMP: combinedDateTime_End,
							I_LOCATION: location,
							I_EQUIPMENT: equipment,
							I_REASON_CODE1: reasonCode1,
							I_REASON_CODE2: reasonCode2,
							I_REASON_CODE3: reasonCode3,
							I_REASON_CODE4: reasonCode4,
							I_REASON_CODE5: reasonCode5,
							I_STOPPAGE_TYPE: stoppageType,
							I_WORK_CENTER: workcenter,
							I_CREATE_NOTIFICATION: notification,
							I_EXPLANATIONS: explanations,
							I_SITE: this.SITE,
							I_RESP_WORK_CENTER: resp_workplace,
							I_FLAG: flag
						},
						"O_JSON",
						this.onPressCreateUpdateDownTimeButtonCB,
						this
					);
				}
			},

			onPressCreateUpdateDownTimeButtonCB: function (iv_data, iv_scope) {
				if (iv_data[1] == "E") {
					MessageBox.error(iv_data[0]);
				} else {
					MessageBox.information(iv_data[0]);
					if (mode == "createStoppage" || mode == "editStoppage") {
						iv_scope.createNotificationFragment.close();
					}
					if (mode == "createNotification") {
						iv_scope.createNotification.close();
					}
					iv_scope.transferRefresh = true;
					iv_scope.getPMNotificationDatas();
				}
			},

			//DURUŞ AKTARLA GELEN BİR DURUŞU REDDEDEN FONKS
			onPressRejectStoppageButton: function () {
				if(sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idExplanations").getValue() == ""){
					MessageBox.error("Lütfen Açıklama alanına reddetme sebebinizi giriniz!");
					return;
				}
				
				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/rejectStoppage/T_Reject_Stoppage", {
						I_ID: updateIndex,
						I_EXPLANATIONS: sap.ui.core.Fragment.byId("Z_CREATE_DOWNTIME", "idExplanations").getValue()
					},
					"O_JSON",
				);

				if (response[1] == "E") {
					MessageBox.error(response[0]);
				} else {
					MessageBox.information(response[0]);
					this.createNotificationFragment.close();
					this.transferRefresh = true;
					this.getPMNotificationDatas();
				}
			},

			//Ekrandan üretim değişimi geri al butonuna basınca çalışan fonks
			onPressProductionBack: function (oEvent) {
				var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
				var oTableData = this.getView().byId("idDurusTable").getModel().getData().Rowsets.Rowset.Row;
				var selectedRow = oTableData[selectedIndex];

				if (selectedRow.FLAG != "X") {
					MessageBox.error("Üretim Değişimi yapılmamış bir duruş için bu işlemi yapamazsınız!");
					return;
				}

				//Duruşu silen diyalog ve Onayla butonuna basılınca çalışan fonksiyon
				MessageBox.warning("İlgili duruş için üretim değişimi geri alınacaktır.\r\n\r\nOnaylıyor musunuz?", {
					actions: ["Onayla", "İptal"],
					emphasizedAction: "Onayla",
					onClose: function (sAction) {
						if (sAction == "Onayla") {
							var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/undoProductionChange/T_UndoProductionChange", {
									I_ID: selectedRow.ID,
									I_SITE: that.SITE
								},
								"O_JSON"
							);

							if (response[1] == "E") {
								MessageBox.error(response[0]);
							} else {
								MessageBox.information(response[0]);
								that.getPMNotificationDatas();
							}
						}
					},
				});
			},

			//Duruş Aktar fragment içindeki Kaydet butonuna basınca çalışan fonksiyon
			onPressTransferDownTimeButton: function () {
				var currentWorkplace = sap.ui.core.Fragment.byId("Z_TRANSFER_DOWNTIME", "idCurrentWorkplace").getValue();
				var nextWorkplace = sap.ui.core.Fragment.byId("Z_TRANSFER_DOWNTIME", "idTransferWorkplace").getSelectedKey();
				if (nextWorkplace == "" || nextWorkplace == null) {
					MessageBox.error("Aktarılacak iş yeri seçiniz!");
					return;
				}

				if (currentWorkplace == nextWorkplace) {
					MessageBox.error("Aktarım yapılacak iş yeri mevcut iş yerinizle aynı olamaz!");
					return;
				}

				if (!nextWorkplace.includes(currentWorkplace)) {
					MessageBox.error("Sadece iş yerinizin ilgili Ambalaj Tesislerine duruş aktarımı yapabilirsiniz!");
					return;
				}

				//Duruş aktarımı yapan diyalog ve Onayla butonuna basılınca çalışan fonksiyon
				MessageBox.warning("İlgili duruş " + nextWorkplace + " iş yerine aktarılacaktır.\r\n\r\nOnaylıyor musunuz?", {
					actions: ["Onayla", "İptal"],
					emphasizedAction: "Onayla",
					onClose: function (sAction) {
						if (sAction == "Onayla") {
							var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/transferStoppage/T_transferStoppage", {
									I_ID: transferIndex,
									I_NEXT_WORKCENTER: nextWorkplace,
									I_SITE: that.SITE
								},
								"O_JSON",
							);

							if (response[1] == "E") {
								MessageBox.error(response[0]);
							} else {
								MessageBox.information(response[0]);
								that.transferStoppageFragment.close();
								that.getPMNotificationDatas();
							}
						}
					},
				});
			},

			//Duruş Böl fragment içindeki Kaydet butonuna basınca çalışan fonksiyon
			onPressStoppageSplitButton: function () {
				//MEVCUT DURUŞUN BAŞLANGIÇ ZAMANI KONTROLÜ
				var StartDate = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartDate2").getDateValue();
				var StartTime = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartTime2").getDateValue();
				if (StartDate == null) {
					MessageBox.error("Mevcut duruşun, başlangıç tarihi alanı boş bırakılamaz!");
					return;
				}
				if (StartTime == null) {
					MessageBox.error("Mevcut duruşun, başlangıç zamanı alanı boş bırakılamaz!");
					return;
				}

				var getFullYear_Start = StartDate.getFullYear();
				var getMonth_Start = StartDate.getMonth();
				var getDate_Start = StartDate.getDate();
				var getHours_Start = StartTime.getHours();
				var getMinutes_Start = StartTime.getMinutes();
				var getSeconds_Start = StartTime.getSeconds();
				var combinedDateTime_Start = new Date(getFullYear_Start, getMonth_Start, getDate_Start, getHours_Start, getMinutes_Start,
					getSeconds_Start);
				if (new Date().getTime() - combinedDateTime_Start.getTime() < 0) {
					MessageBox.error("Mevcut duruşun, başlangıç zamanı gelecek zamanda olamaz!");
					return;
				}

				//MEVCUT DURUŞUN BİTİŞ ZAMANI KONTROLÜ
				var EndDate = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndDate2").getDateValue();
				var EndTime = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndTime2").getDateValue();
				if (EndDate == null) {
					MessageBox.error("Mevcut duruşun, bitiş tarihi alanı boş bırakılamaz!");
					return;
				}
				if (EndTime == null) {
					MessageBox.error("Mevcut duruşun, bitiş zamanı alanı boş bırakılamaz!");
					return;
				}

				if (EndDate != null && EndTime != null) {
					var getFullYear_End = EndDate.getFullYear();
					var getMonth_End = EndDate.getMonth();
					var getDate_End = EndDate.getDate();
					var getHours_End = EndTime.getHours();
					var getMinutes_End = EndTime.getMinutes();
					var getSeconds_End = EndTime.getSeconds();
					var combinedDateTime_End = new Date(getFullYear_End, getMonth_End, getDate_End, getHours_End, getMinutes_End, getSeconds_End);
					if (new Date().getTime() - combinedDateTime_End.getTime() < 0) {
						MessageBox.error("Mevcut duruşun, bitiş zamanı gelecek zamanda olamaz!");
						return;
					}

					if (combinedDateTime_End.getTime() - combinedDateTime_Start.getTime() == 0) {
						MessageBox.error("Mevcut duruşun, bitiş zamanı, başlangıç zamanı ile aynı olamaz!");
						return;
					}
					if (combinedDateTime_End.getTime() - combinedDateTime_Start.getTime() < 0) {
						MessageBox.error("Mevcut duruşun, bitiş zamanı, başlangıç zamanından erken olamaz!");
						return;
					}
				}

				//MEVCUT DURUŞUN SÜRE KONTROLÜ
				var duration = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idTimeInMinutes2").getValue();
				if (duration == "") {
					MessageBox.error("Mevcut duruşun, duruş süresi boş bırakılamaz!");
					return;
				}
				if (duration <= 0) {
					MessageBox.error("Mevcut duruşun, duruş süresi sıfır veya negatif değer olamaz!");
					return;
				}

				//YARATILACAK DURUŞUN BAŞLANGIÇ ZAMANI KONTROLÜ
				var newStartDate = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartDate3").getDateValue();
				var newStartTime = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idStartTime3").getDateValue();
				if (newStartDate == null) {
					MessageBox.error("Yaratılacak duruşun, başlangıç tarihi alanı boş bırakılamaz!");
					return;
				}
				if (newStartTime == null) {
					MessageBox.error("Yaratılacak duruşun, başlangıç zamanı alanı boş bırakılamaz!");
					return;
				}

				var newgetFullYear_Start = newStartDate.getFullYear();
				var newgetMonth_Start = newStartDate.getMonth();
				var newgetDate_Start = newStartDate.getDate();
				var newgetHours_Start = newStartTime.getHours();
				var newgetMinutes_Start = newStartTime.getMinutes();
				var newgetSeconds_Start = newStartTime.getSeconds();
				var newcombinedDateTime_Start = new Date(newgetFullYear_Start, newgetMonth_Start, newgetDate_Start, newgetHours_Start,
					newgetMinutes_Start, newgetSeconds_Start);
				if (new Date().getTime() - newcombinedDateTime_Start.getTime() < 0) {
					MessageBox.error("Yaratılacak duruşun, başlangıç zamanı gelecek zamanda olamaz!");
					return;
				}

				//MEVCUT DURUŞUN BİTİŞ ZAMANI KONTROLÜ
				var newEndDate = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndDate3").getDateValue();
				var newEndTime = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idEndTime3").getDateValue();
				if (newEndDate == null) {
					MessageBox.error("Yaratılacak duruşun, bitiş tarihi alanı boş bırakılamaz!");
					return;
				}
				if (newEndTime == null) {
					MessageBox.error("Yaratılacak duruşun, bitiş zamanı alanı boş bırakılamaz!");
					return;
				}

				if (newEndDate != null && newEndTime != null) {
					var newgetFullYear_End = newEndDate.getFullYear();
					var newgetMonth_End = newEndDate.getMonth();
					var newgetDate_End = newEndDate.getDate();
					var newgetHours_End = newEndTime.getHours();
					var newgetMinutes_End = newEndTime.getMinutes();
					var newgetSeconds_End = newEndTime.getSeconds();
					var newcombinedDateTime_End = new Date(newgetFullYear_End, newgetMonth_End, newgetDate_End, newgetHours_End, newgetMinutes_End,
						newgetSeconds_End);
					if (new Date().getTime() - newcombinedDateTime_End.getTime() < 0) {
						MessageBox.error("Yaratılacak duruşun, bitiş zamanı gelecek zamanda olamaz!");
						return;
					}

					if (newcombinedDateTime_End.getTime() - newcombinedDateTime_Start.getTime() == 0) {
						MessageBox.error("Yaratılacak duruşun, bitiş zamanı, başlangıç zamanı ile aynı olamaz!");
						return;
					}

					if (newcombinedDateTime_End.getTime() - newcombinedDateTime_Start.getTime() < 0) {
						MessageBox.error("Yaratılacak duruşun, bitiş zamanı, başlangıç zamanından erken olamaz!");
						return;
					}
				}

				//MEVCUT DURUŞUN SÜRE KONTROLÜ
				var newduration = sap.ui.core.Fragment.byId("Z_SPLIT_DOWNTIME", "idTimeInMinutes3").getValue();
				if (newduration == "") {
					MessageBox.error("Yaratılacak duruşun, duruş süresi boş bırakılamaz!");
					return;
				}
				if (newduration <= 0) {
					MessageBox.error("Yaratılacak duruşun, duruş süresi sıfır veya negatif değer olamaz!");
					return;
				}

				combinedDateTime_Start = combinedDateTime_Start.toISOString();
				combinedDateTime_End = combinedDateTime_End.toISOString();
				newcombinedDateTime_Start = newcombinedDateTime_Start.toISOString();
				newcombinedDateTime_End = newcombinedDateTime_End.toISOString();

				//Duruşu bölen diyalog ve Onayla butonuna basılınca çalışan fonksiyon
				MessageBox.warning("İlgili duruş sistemde " + duration + " ve " + newduration +
					" dk. olarak ikiye bölünecektir.\r\n\r\nOnaylıyor musunuz?", {
						actions: ["Onayla", "İptal"],
						emphasizedAction: "Onayla",
						onClose: function (sAction) {
							if (sAction == "Onayla") {
								var response = TransactionCaller.sync(
									"ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/splitStoppage/T_splitStoppage", {
										I_EXISTING_ID: splitIndex,
										I_EXISTING_START: combinedDateTime_Start,
										I_EXISTING_END: combinedDateTime_End,
										I_CREATE_START: newcombinedDateTime_Start,
										I_CREATE_END: newcombinedDateTime_End,
										I_SITE: that.SITE
									},
									"O_JSON"
								);

								if (response[1] == "E") {
									MessageBox.error(response[0]);
								} else {
									MessageBox.information(response[0]);
									that.splitStoppageFragment.close();
									that.getPMNotificationDatas();
								}
							}
						},
					});
			},

			//Fragment içindeki İptal butonuna basınca fragment kapatan fonksiyon
			onPressCancelDownTimeButton: function () {
				if (this.createNotificationFragment) {
					this.createNotificationFragment.close();
				}

				if (this.transferStoppageFragment) {
					this.transferStoppageFragment.close();
				}

				if (this.splitStoppageFragment) {
					this.splitStoppageFragment.close();
				}

				if (this.createNotification) {
					this.createNotification.close();
				}
			},

			//Bildirim fragmentını kapatan fonksiyon
			onFragmentCancel: function () {
				if (this.NotificationListFragment) {
					this.NotificationListFragment.close();
				}
			},

			//Ekranda Bobin Değiştir butonuna basılınca çalışan fonksiyon
			onPressBobinChange: function (oEvent) {
				var oView = this.getView();

				var selectedPathRaw = oEvent.getSource().getBindingContext().getPath(); //dummy/row/2
				var selectedIndex = selectedPathRaw.substr(
					selectedPathRaw.lastIndexOf("/") + 1,
					selectedPathRaw.lenght
				);
				var list = oView.byId("idDurusTable");
				list.setSelectedItem(list.getItems()[selectedIndex], true, true);

				this.selectedLine = oView.byId("idWsComboBox").getSelectedKey();
				if (!this.selectedLine) {
					MessageBox.error("İş yeri seçiniz.");
					return;
				}

				// create dialog lazily
				if (!this.pDialog) {
					this.pDialog = Fragment.load({
						id: oView.getId(),
						name: "stoppageScreen.view.fragments.Bobin",
						controller: this,
					}).then(function (oDialog) {
						// connect dialog to the root view of this component (models, lifecycle)
						oView.addDependent(oDialog);
						return oDialog;
					});
				}

				var oTableData = this.getView().byId("idDurusTable").getModel().getData().Rowsets.Rowset.Row;
				var selectedRow = oTableData[selectedIndex];
				bobinIndex = selectedRow.ID;

				this.pDialog.then(function (oDialog) {
					oDialog.open();
				});
				this.getAllRes(this.selectedLine);
				TransactionCaller.async(
					"ECZ_MES-4.0/KONVERTING/stoppageScreen/T_GET_ActiveOrder", {
						I_WC: this.selectedLine,
						I_SITE: this.SITE
					},
					"O_JSON",
					this.getAllUnitsCB,
					this,
					"GET"
				);
			},

			getAllUnitsCB: function (iv_data, iv_scope) {
				var myModel = new sap.ui.model.json.JSONModel();
				var stockModel = new JSONModel();
				stockModel.setSizeLimit(1000);
				var dataHolder;
				if (!Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
					var arrayHolder = [];
					arrayHolder.push(iv_data[0].Rowsets.Rowset.Row);
					dataHolder = arrayHolder;
				} else {
					dataHolder = iv_data[0].Rowsets.Rowset.Row;
				}
				stockModel.setData(dataHolder);
				iv_scope.getView().setModel(stockModel);
				iv_scope.getView().getModel().refresh();
				iv_scope.getView().byId("idBobbinCombobox").setValue("");
			},

			getAllRes: function (iv_line) {
				TransactionCaller.async("ECZ_MES-4.0/KONVERTING/stoppageScreen/T_GET_LOC", {
						I_SITE: this.SITE,
						I_LINE: iv_line
					},
					"O_JSON",
					this.getAllResCB,
					this,
					"GET"
				);
			},

			getAllResCB: function (iv_data, iv_scope) {
				var myModel = new JSONModel();
				var RESOURCEContainer = [];

				if (Array.isArray(iv_data[0].CHILD_WORKCENTER?.workCenterMemberList)) {
					myModel.setData(iv_data[0]);
				} else if (!iv_data[0].CHILD_WORKCENTER?.workCenterMemberList) {
					myModel.setData(null);
				} else {
					var obj_iv_data = iv_data[0];
					var dummyData = [];
					dummyData.push(iv_data[0].CHILD_WORKCENTER.workCenterMemberList);
					obj_iv_data.CHILD_WORKCENTER.workCenterMemberList = dummyData;
					myModel.setData(obj_iv_data);
				}

				myModel.getData().CHILD_WORKCENTER.workCenterMemberList.forEach(
					function (helin) {
						RESOURCEContainer.push({
							resourceRef: helin.resourceRef.substr(helin.resourceRef.lastIndexOf(",") + 1),
						});
					}
				);

				myModel.setData(RESOURCEContainer);
				/*
				//var oModel = new sap.ui.model.xml.XMLModel(iv_data);
				myModel.setData(iv_data[0].CHILD_WORKCENTER.workCenterMemberList.forEach(
					function (helin) {
						RESOURCEContainer.push({
							resourceRef: helin.resourceRef.substr(helin.resourceRef.lastIndexOf(",") + 1),
						});
					}
				));
                    */
				//myModel.setData(RESOURCEContainer);
				iv_scope.getView().byId("idBobbinCombobox1").setModel(myModel);
				iv_scope.getView().byId("idBobbinCombobox1").getModel().refresh();
				//iv_scope.getAllUnits();
			},

			onCloseDialog: function () {
				this.byId("bobinDialog").close();
				this.getPMNotificationDatas();
			},

			handleSavePress: function (oEvent) {
				//var id = this.getView().byId("idBobbinCombobox").getSelectedKey();
				// var id = this.getView().byId("idBobbinCombobox").getModel().getData().find((o) => o.INVENTORY_ID == this.getView().byId(
				// 	"idBobbinCombobox").getSelectedKey()).BATCH_ID;

				var id = this.getView().byId("idProductsTable").getModel().getData()[this.getView().byId("idProductsTable").getSelectedContextPaths()[
					0].split("/")[1]].BATCH_ID;

				var notPorducedINMEID = this.getView().byId("idProductsTable").getModel().getData()[this.getView().byId("idProductsTable").getSelectedContextPaths()[
					0].split("/")[1]].INVENTORY_ID;

				var itemBo = this.getView().byId("idProductsTable").getModel().getData()[this.getView().byId("idProductsTable").getSelectedContextPaths()[
					0].split("/")[1]].ITEM_BO;

				var location = this.getView().byId("idBobbinCombobox1").getSelectedKey();

				if (!location) {
					MessageBox.error("Lokasyon seçiniz");
					return;
				}

				if (!id) {
					MessageBox.error("Parti seçiniz");
					return;
				}
				this.showBusyIndicator(5000, 0);

				TransactionCaller.async("ECZ_MES-4.0/KONVERTING/stoppageScreen/T_ReserveInventory", {
						I_BATCH: id,
						I_LOCATION: location,
						I_WORKCENTER: this.selectedLine,
						I_SITE: this.SITE,
						I_NOT_PRODUCED_INME: notPorducedINMEID,
						I_BOBIN_INDEX: bobinIndex,
						I_ITEM_BO: itemBo
					},
					"O_JSON",
					this.handleSavePressCB,
					this,
					"GET"
				);
			},

			handleSavePressCB: function (iv_data, iv_scope) {
				if (iv_data[1] == "E") {
					MessageBox.error(iv_data[0]);
				} else {
					MessageBox.information(iv_data[0]);
					iv_scope.byId("bobinDialog").close();
					iv_scope.getPMNotificationDatas();
				}
			},

			handleBobbinSelectionChange: function (oEvent) {
				var selectedIndex = oEvent.getSource().getSelectedContextPaths()[0];
				selectedIndex = selectedIndex.substr(
					selectedIndex.lastIndexOf("/") + 1,
					selectedIndex.length
				);
				var invId = oEvent.getSource().getModel().getData()[selectedIndex]
					.INVENTORY_ID;
				this.getView().byId("idBobbinCombobox").setSelectedKey(invId);
			},

			handlePress: function (oEvent) {
				var selectedIndex = oEvent.getSource().getSelectedContextPaths()[0];
				var selectedRow = selectedIndex.substring(
					selectedIndex.lastIndexOf("/") + 1,
					selectedIndex.length
				);
				var selectedData = oEvent.getSource().getModel().getData()
					.ProductCollection[selectedRow];
				var miktar = selectedData.Miktar;
				MessageToast.show(miktar);
			},

			handleBobbinCbChange: function (oEvent) {
				var oValidatedComboBox = oEvent.getSource(),
					sSelectedKey = oValidatedComboBox.getSelectedKey(),
					sValue = oValidatedComboBox.getValue();

				if (!sSelectedKey && sValue) {
					oValidatedComboBox.setValueState(ValueState.Error);
					oValidatedComboBox.setValueStateText(
						"Lütfen geçerli bir parti numarası giriniz."
					);
				} else {
					oValidatedComboBox.setValueState(ValueState.None);
				}
			},
			showBusyIndicator: function (iDuration, iDelay) {
				BusyIndicator.show(iDelay);

				if (iDuration && iDuration > 0) {
					if (this._sTimeoutId) {
						clearTimeout(this._sTimeoutId);
						this._sTimeoutId = null;
					}

					this._sTimeoutId = setTimeout(function () {
						this.hideBusyIndicator();
					}.bind(this), iDuration);
				}
			},

			hideBusyIndicator: function () {
				BusyIndicator.hide();
				this.getPackageDetails();
			},

		});
	});