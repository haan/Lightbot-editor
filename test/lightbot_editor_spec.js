describe("Sample Test", function() {
//    var test_label;
//
//    beforeEach(function() {
//        var html_content = "" +
//            "<div>" +
//            "<label id='test-label'>This is a label</label>" +
//            "</div>";
//
//        setFixtures(html_content);
//
//        test_label = $("#test-label");
//    });
//
//    it("have the label", function() {
//        expect(test_label).toExist();
//        expect(test_label).toBeVisible();
//    });
//
//    it("should the specified text for the label", function() {
//        expect(test_label.text()).toEqual("This is a label");
//    });

  function rotateArray(data) {
    var w = data.length;
    var h = data[0].length;

    var retData = [];
    for (var i = 0; i < h; i++) {
      retData[i] = [];
    }

    for (i = 0; i < h; i++) {
      for (var j = 0; j < w; j++) {
        retData[i][j] = data[w - j - 1][i];
      }
    }

    return retData;
  }

  it("should create an editor", function() {
    var data = [[2, 1], [1, 1], [1, 1]];
    console.log(data);
    data = rotateArray(data);
    console.log(data);
    data = rotateArray(data);
    console.log(data);
    data = rotateArray(data);
    console.log(data);
  });
});
