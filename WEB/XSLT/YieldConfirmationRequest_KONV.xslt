<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

    <xsl:template match="/">
        <BAPI_PRODORDCONF_CREATE_TT >
            <xsl:for-each select="yieldConfirmationRequest_KONV/SendERPDatas">
                <item>
                    <site>
                        <xsl:value-of select="site"/>
                    </site>
                    <shopOrderNo>
                        <xsl:value-of select="shopOrderNo"/>
                    </shopOrderNo>
                    <quantity101>
                        <xsl:value-of select="quantity101"/>
                    </quantity101>
                    <operation>
                        <xsl:value-of select="operation"/>
                    </operation>
                    <dateTime>
                        <xsl:value-of select="dateTime"/>
                    </dateTime>
                    <user>
                        <xsl:value-of select="user"/>
                    </user>

                </item>
            </xsl:for-each>
        </BAPI_PRODORDCONF_CREATE_TT >

    </xsl:template>
</xsl:stylesheet>
