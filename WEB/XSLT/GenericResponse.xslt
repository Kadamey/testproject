<?xml version='1.0' ?>
 <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                 xmlns:sch="http://sap.com/xi/ME/erpcon" xmlns:ns1="http://sap.com/xi/ME" xmlns:me="http://sap.com/xi/ME"
                 xmlns:meint="http://sap.com/xi/MEINT" xmlns:gdt="http://sap.com/xi/SAPGlobal/GDT">
    <xsl:template match="/">
       <xsl:choose>
          <xsl:when test="//Output">
             <sch:ResponseAction>
                <sch:status><xsl:value-of select = "//Output/Status"/></sch:status>
                <sch:message><xsl:value-of select = "//Output/Message"/></sch:message>
             </sch:ResponseAction>
          </xsl:when>
          <xsl:otherwise>
             <sch:ResponseAction>
                <sch:status>SYS_ERROR</sch:status>
                <sch:message>SAP ME Server Error!</sch:message>
             </sch:ResponseAction>
          </xsl:otherwise>
       </xsl:choose>
    </xsl:template>
 </xsl:stylesheet>