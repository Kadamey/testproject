<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:me="http://sap.com/xi/ME">
    <xsl:output indent="yes" method="xml" />
    <xsl:template match="/">
        <DOCS>
            <xsl:for-each select="//Rowsets/Rowset/Row">
                <xsl:variable name="currentPlant" select="PLANT" />
                <xsl:call-template name="startDoc">
                    <xsl:with-param name="plant" select="$currentPlant" />
                </xsl:call-template>
            </xsl:for-each>
        </DOCS>
    </xsl:template>
    <xsl:template name="startDoc">
        <xsl:param name="plant" />
            <Z_CHRMAS05>
                <xsl:apply-templates select="//IDOC">
                    <xsl:with-param name="plant" select="$plant" />
                </xsl:apply-templates>
            </Z_CHRMAS05>

    </xsl:template>
    <xsl:template match="*">
            <xsl:param name="plant" />
            <xsl:copy>
                <xsl:apply-templates>
                    <xsl:with-param name="plant" select="$plant" />
                </xsl:apply-templates>
            </xsl:copy>
    </xsl:template>
    <xsl:template match="E1CABNM ">
        <xsl:param name="plant" />
            <xsl:copy>
                <PLANT><xsl:value-of select="$plant"/></PLANT>
                <xsl:apply-templates />
            </xsl:copy>
    </xsl:template>
    <xsl:template match="DOCNUM">
	<xsl:param name="plant" />
	<DOCNUM><xsl:value-of select="."/>-<xsl:value-of select="$plant"/></DOCNUM>
    </xsl:template>
</xsl:stylesheet>