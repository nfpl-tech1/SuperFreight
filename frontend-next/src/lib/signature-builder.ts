import {
  LOGO_AMTOI,
  LOGO_BCBA,
  LOGO_FFI,
  LOGO_FIATA,
  LOGO_IATA,
  LOGO_MTO,
  LOGO_WCA,
  NAGARKOT_LOGO,
} from "./signature-assets";

export type SignatureDraft = {
  fullName: string;
  designation: string;
  phone: string;
  email: string;
  departmentName?: string | null;
};

const COMPANY_WEBSITE = "https://nagarkot.co.in/";
const COMPANY_LINKEDIN = "https://www.linkedin.com/company/nagarkot/";

const COLOR_BRAND = "#1A3E70";
const COLOR_TAGLINE = "#7F6000";
const COLOR_LINK = "#223F6D";
const COLOR_GREEN = "#70AD47";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function getInitialSignatureDraft(user: {
  name?: string | null;
  email: string;
  departmentName?: string | null;
}): SignatureDraft {
  return {
    fullName: user.name ?? "",
    designation: "",
    phone: "",
    email: user.email,
    departmentName: user.departmentName ?? "",
  };
}

// Builds the signature using a <table> layout. Tables are intentional:
// the backend tightener (rfq-mail-builder.ts:tightenSignatureBlockSpacing)
// rewrites margin/line-height on every <p> and <div>, which would flatten
// the spacing here. <table>/<tr>/<td> are untouched and are also the most
// compatible layout primitive across email clients (especially Outlook).
export function buildSignatureHtml(draft: SignatureDraft) {
  const fullName = escapeHtml(collapseWhitespace(draft.fullName));
  const designation = escapeHtml(collapseWhitespace(draft.designation));
  const phone = escapeHtml(collapseWhitespace(draft.phone));
  const certImg = (
    src: string,
    width: number,
    height: number,
    alt: string,
    spacing = "",
  ) =>
    `<img border="0" width="${width}" height="${height}" src="${src}" alt="${alt}" style="display:inline-block;border:0;outline:none;text-decoration:none;vertical-align:middle;width:${width}px;height:${height}px;">${spacing}`;

  const certificationLogos = [
    certImg(LOGO_FIATA, 51, 27, "FIATA", "&nbsp;&nbsp;"),
    certImg(LOGO_WCA, 33, 35, "WCA World", "&nbsp;&nbsp;"),
    certImg(LOGO_IATA, 35, 35, "IATA", "&nbsp;&nbsp;&nbsp;"),
    certImg(LOGO_FFI, 47, 42, "FFFAI", "&nbsp;&nbsp;&nbsp;&nbsp;"),
    certImg(LOGO_MTO, 37, 37, "MTO", "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"),
    certImg(LOGO_AMTOI, 40, 37, "AMTOI"),
    certImg(LOGO_BCBA, 49, 49, "BCBA"),
  ].join("");

  return [
    `<p class="MsoNormal"><span style="font-size:12.0pt;color:${COLOR_BRAND};mso-ligatures:none;mso-fareast-language:EN-IN">Best Regards <o:p></o:p></span></p>`,
    `<p class="MsoNormal"><b><span style="font-size:12.0pt;color:${COLOR_BRAND};mso-ligatures:none;mso-fareast-language:EN-IN">${fullName}<o:p></o:p></span></b></p>`,
    `<p class="MsoNormal"><span style="font-size:12.0pt;color:${COLOR_BRAND};mso-ligatures:none;mso-fareast-language:EN-IN">${designation}<o:p></o:p></span></p>`,
    `<p class="MsoNormal"><span style="font-size:12.0pt;mso-ligatures:none;mso-fareast-language:EN-IN">${phone}<o:p></o:p></span></p>`,
    `<p class="MsoNormal"><span style="font-size:10.0pt;mso-fareast-language:EN-IN"><img border="0" width="208" height="26" src="${NAGARKOT_LOGO}" alt="Nagarkot" style="display:block;border:0;outline:none;text-decoration:none;width:208px;height:26px;"></span><span style="font-size:10.0pt;mso-ligatures:none;mso-fareast-language:EN-IN"><o:p></o:p></span></p>`,
    `<p class="MsoNormal"><b><span style="font-size:10.0pt;color:${COLOR_TAGLINE};mso-ligatures:none;mso-fareast-language:EN-IN">We deliver Care, not just Cargo | Celebrating Logistics Excellence since 1988</span></b><b><span style="font-size:9.0pt;color:${COLOR_TAGLINE};mso-ligatures:none;mso-fareast-language:EN-IN"><br></span></b><span style="font-size:8.0pt;mso-ligatures:none;mso-fareast-language:EN-IN">3PL &amp; Warehousing | Customs Brokers | Freight Forwarding | Transportation | Consultancy</span><span style="font-size:9.0pt;mso-ligatures:none;mso-fareast-language:EN-IN"><o:p></o:p></span></p>`,
    `<p class="MsoNormal"><b><span style="font-size:10.0pt;color:${COLOR_BRAND};mso-ligatures:none;mso-fareast-language:EN-IN">Nagarkot Forwarders Private Limited</span></b><span style="font-size:9.0pt;mso-ligatures:none;mso-fareast-language:EN-IN"><br>207, Mahinder Chambers (Rear entrance), <o:p></o:p></span></p>`,
    `<p class="MsoNormal"><span style="font-size:9.0pt;mso-ligatures:none;mso-fareast-language:EN-IN">W. T. Patil Marg, Chembur (E), Mumbai 400071, India<br></span><span style="font-size:12.0pt;mso-fareast-language:EN-IN"><a href="${COMPANY_LINKEDIN}"><b><span style="font-size:9.0pt;color:${COLOR_LINK};mso-ligatures:none">Linkedin</span></b></a></span><b><span style="font-size:9.0pt;color:${COLOR_LINK};mso-ligatures:none;mso-fareast-language:EN-IN">&nbsp;&nbsp;&nbsp; &nbsp;</span></b><b><span style="font-size:9.0pt;mso-ligatures:none;mso-fareast-language:EN-IN">&nbsp;</span></b><span style="font-size:12.0pt;mso-fareast-language:EN-IN"><a href="${COMPANY_WEBSITE}"><b><span style="font-size:9.0pt;color:${COLOR_LINK};mso-ligatures:none">Website</span></b></a></span><span style="font-size:9.0pt;mso-ligatures:none;mso-fareast-language:EN-IN"><o:p></o:p></span></p>`,
    `<p class="MsoNormal"><span style="font-size:10.0pt;mso-fareast-language:EN-IN;white-space:nowrap;">${certificationLogos}</span><span style="font-size:8.0pt;mso-ligatures:none;mso-fareast-language:EN-IN"><o:p></o:p></span></p>`,
    `<p class="MsoNormal" style="margin-bottom:12pt;"><span style="font-size:8.0pt;color:${COLOR_GREEN};mso-ligatures:none;mso-fareast-language:EN-IN">Go green! Please consider your environmental responsibility before printing this email</span><b><span style="font-size:9.0pt;color:black;mso-ligatures:none;mso-fareast-language:EN-IN"><o:p></o:p></span></b></p>`,
  ].join("");
}
