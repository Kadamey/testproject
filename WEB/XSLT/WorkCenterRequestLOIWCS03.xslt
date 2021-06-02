<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:plan="http://www.sap.com/me/plant" xmlns:mep="mepapi:com:sap:me:plant" xmlns:sch="http://www.sap.com/me/schedulingstandards" xmlns:com="http://www.sap.com/me/common">
	<xsl:template match="/LOIWCS03">
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
			<soapenv:Header/>
			<soapenv:Body>
				<mep:createOrUpdateWorkCenterWithResources>
					<xsl:variable name="site" select="IDOC/E1CRHDL/WERKS"/>
					<com:Site>
						<xsl:value-of select="IDOC/E1CRHDL/WERKS"/>
					</com:Site>
					<com:workCenter>
						<xsl:value-of select="IDOC/E1CRHDL/ARBPL"/>
					</com:workCenter>
					<xsl:for-each select="IDOC/E1CRHDL/E1CRTXL">
						<plan:workCenterTranslationList>
							<com:locale>
								<xsl:value-of select="SPRAS"/>
							</com:locale>
							<com:description>
								<xsl:value-of select="KTEXT"/>
							</com:description>
						</plan:workCenterTranslationList>
					</xsl:for-each>
					<plan:status>ENABLED</plan:status>
					<plan:workCenterCategory>NONE</plan:workCenterCategory>
					<plan:workCenterType>ASSEMBLY</plan:workCenterType>
					<plan:assignmentEnforcement>NONE</plan:assignmentEnforcement>
					<plan:canBeReleasedTo>true</plan:canBeReleasedTo>
					<plan:erpInternalID>
						<xsl:value-of select="IDOC/E1CRHDL/OBJID"/>
					</plan:erpInternalID>
					<plan:erpWorkCenter>true</plan:erpWorkCenter>
					<plan:erpWorkCenterName>
						<xsl:value-of select="IDOC/E1CRHDL/ARBPL"/>
					</plan:erpWorkCenterName>
					<plan:productionSupplyArea>
						<xsl:value-of select="IDOC/E1CRHDL/PRVBE"/>
					</plan:productionSupplyArea>
					<xsl:for-each select="IDOC/E1CRHDL/E1CRCAL[E1KAKOL/KAPAR='001']">
						<xsl:for-each select="E1KAKOL/E1KAKOIL">
							<xsl:variable name="sequence" select="position()"/>
							<plan:resourceMemberList>
								<plan:sequence>
									<xsl:number value="$sequence*10" format="1"/>
								</plan:sequence>
								<com:resource>
									<xsl:value-of select="NAME"/>
								</com:resource>
								<com:description>
									<xsl:choose>
										<xsl:when test="(string(E1KAKTL2[LANGUA_ISO=//SupportedPlant/LanguageISO]/KTEXT))">
											<xsl:value-of select="E1KAKTL2[LANGUA_ISO=//SupportedPlant/LanguageISO]/KTEXT"/>
										</xsl:when>
										<xsl:when test="(string(E1KAKTL2[LANGUA_ISO='EN']/KTEXT))">
											<xsl:value-of select="E1KAKTL2[LANGUA_ISO='EN']/KTEXT"/>
										</xsl:when>
										<xsl:when test="(string(E1KAKTL2/KTEXT))">
											<xsl:value-of select="E1KAKTL2/KTEXT"/>
										</xsl:when>
										<xsl:otherwise>
											<xsl:value-of select="NAME"/>
										</xsl:otherwise>
									</xsl:choose>
								</com:description>
								<plan:setupState>OPEN</plan:setupState>
								<plan:statusRef>StatusBO:<xsl:value-of select="$site"/>,301</plan:statusRef>
								<plan:processResource>true</plan:processResource>
								<xsl:if test="EQUNR">
									<plan:erpEquipmentNumber>
										<xsl:value-of select="EQUNR"/>
									</plan:erpEquipmentNumber>
								</xsl:if>
								<plan:erpInternalID>
									<xsl:value-of select="KAPID"/>
								</plan:erpInternalID>
								<plan:erpCapacityCategory>
									<xsl:value-of select="KAPAR"/>
								</plan:erpCapacityCategory>
								<xsl:if test="RESTYPE1">
									<plan:resourceTypeResourceList>
										<ref>ResourceTypeBO:<xsl:value-of select="$site"/>,<xsl:value-of select="RESTYPE1"/>
										</ref>
									</plan:resourceTypeResourceList>
								</xsl:if>
								<xsl:if test="RESTYPE2">
									<plan:resourceTypeResourceList>
										<ref>ResourceTypeBO:<xsl:value-of select="$site"/>,<xsl:value-of select="RESTYPE2"/>
										</ref>
									</plan:resourceTypeResourceList>
								</xsl:if>
								<xsl:if test="RESTYPE3">
									<plan:resourceTypeResourceList>
										<ref>ResourceTypeBO:<xsl:value-of select="$site"/>,<xsl:value-of select="RESTYPE3"/>
										</ref>
									</plan:resourceTypeResourceList>
								</xsl:if>
							</plan:resourceMemberList>
						</xsl:for-each>
					</xsl:for-each>
					<xsl:if test="ET_VALUE_KEYS/item/PAR_DESCRIPTION != ''">
						<plan:standardValueKeyRef>StandardValueKeyBO:<xsl:value-of select="$site"/>,<xsl:value-of select="ET_VALUE_KEYS/item[ACTIVITY_NO='1']/VALUE_KEY"/>
						</plan:standardValueKeyRef>
						<plan:standardValueKeyFullConfiguration>
							<sch:ref>StandardValueKeyBO:<xsl:value-of select="$site"/>,<xsl:value-of select="ET_VALUE_KEYS/item[ACTIVITY_NO='1']/VALUE_KEY"/>
							</sch:ref>
							<sch:name>
								<xsl:value-of select="ET_VALUE_KEYS/item[ACTIVITY_NO='1']/VALUE_KEY"/>
							</sch:name>
							<sch:description>
								<xsl:value-of select="ET_VALUE_KEYS/item[ACTIVITY_NO='1']/SVK_DESCRIPTION"/>
							</sch:description>
							<sch:activityLabelOne>
								<xsl:value-of select="ET_VALUE_KEYS/item[ACTIVITY_NO='1']/PAR_DESCRIPTION"/>
							</sch:activityLabelOne>
							<sch:activityLabelTwo>
								<xsl:value-of select="ET_VALUE_KEYS/item[ACTIVITY_NO='2']/PAR_DESCRIPTION"/>
							</sch:activityLabelTwo>
							<sch:activityLabelThree>
								<xsl:value-of select="ET_VALUE_KEYS/item[ACTIVITY_NO='3']/PAR_DESCRIPTION"/>
							</sch:activityLabelThree>
							<sch:activityLabelFour>
								<xsl:value-of select="ET_VALUE_KEYS/item[ACTIVITY_NO='4']/PAR_DESCRIPTION"/>
							</sch:activityLabelFour>
							<sch:activityLabelFive>
								<xsl:value-of select="ET_VALUE_KEYS/item[ACTIVITY_NO='5']/PAR_DESCRIPTION"/>
							</sch:activityLabelFive>
							<sch:activityLabelSix>
								<xsl:value-of select="ET_VALUE_KEYS/item[ACTIVITY_NO='6']/PAR_DESCRIPTION"/>
							</sch:activityLabelSix>
						</plan:standardValueKeyFullConfiguration>
					</xsl:if>
				</mep:createOrUpdateWorkCenterWithResources>
			</soapenv:Body>
		</soapenv:Envelope>
	</xsl:template>
</xsl:stylesheet>