describe("Sample Test", function() {
    var test_label;

    beforeEach(function() {
        var html_content = "" +
            "<div>" +
            "<label id='test-label'>This is a label</label>" +
            "</div>";

        setFixtures(html_content);

        test_label = $("#test-label");
    });

    it("have the label", function() {
        expect(test_label).toExist();
        expect(test_label).toBeVisible();
    });

    it("should the specified text for the label", function() {
        expect(test_label.text()).toEqual("This is a label");
    });
});
