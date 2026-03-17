// Helper to generate coordinates and attributes matching govmap.ShelterResult
const generateMockShelters = (center: L.LatLng): govmap.ShelterResult[] => {
  const shelterNames = [
    "מקלט ציבורי 101",
    "מרחב מוגן עירוני",
    "מקלט מרכזי - גן העיר",
    "מקלט תת-קרקעי",
    "מרכז קהילתי מוגן",
    "מקלט רחוב הרצל",
    "חניון מוגן",
    "מקלט ספריית העיר",
    "מרחב מוגן - מתנ''ס",
    "מקלט בניין העירייה",
  ];

  const addresses = [
    "רחוב רוטשילד 12",
    "שדרות בן גוריון 45",
    "רחוב ז'בוטינסקי 8",
    "רחוב אלנבי 102",
    "רחוב דיזנגוף 15",
    "רחוב ויצמן 3",
    "דרך נמיר 50",
    "רחוב הירקון 120",
    "רחוב אבן גבירול 22",
    "רחוב ביאליק 7",
  ];

  return shelterNames.map((name, i) => {
    // Generate slight offsets for the coordinates
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;

    return {
      // GovMap uses ITM (x, y), but for mocking we'll store GPS here
      // or convert them if you're using the govmap.itmToGeo function.
      x: center.lng + lngOffset,
      y: center.lat + latOffset,
      distance: Math.floor(Math.random() * 800) + 100,
      attributes: {
        שם_מקלט: name,
        כתובת: addresses[i],
        עיר: "תל אביב",
      },
    };
  });
};

export default generateMockShelters;
