function Services_getStatus() {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "ok",
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}
