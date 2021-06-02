<?xml version='1.0' ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<sch:ResponseAction xmlns:sch="http://sap.com/xi/ME/erpcon">
			<xsl:choose>

			<xsl:when test="BAPI_PRODORDCONF_CREATE_TT/TABLES/DETAIL_RETURN//item[TYPE='E']">
							<sch:status>SYS_ERROR</sch:status>
							<sch:message><xsl:value-of select="concat('BAPI call failed! ', BAPI_PRODORDCONF_CREATE_TT/TABLES/DETAIL_RETURN/item/MESSAGE)"/></sch:message>
						</xsl:when>
<xsl:otherwise>
	<sch:status>PASSED</sch:status>
					<sch:message><xsl:value-of select="concat('BAPI call succeeded! ', BAPI_PRODORDCONF_CREATE_TT/TABLES/DETAIL_RETURN/item/MESSAGE)"/></sch:message>

				</xsl:otherwise>
			</xsl:choose>
		</sch:ResponseAction>
	</xsl:template>
</xsl:stylesheet>