describe('CopyPaste', () => {
  const id = 'testContainer';

  beforeEach(function() {
    this.$container = $(`<div id="${id}"></div>`).appendTo('body');
    // Installing spy stabilizes the tests. Without that on CI and real browser there are some
    // differences in results.
    spyOn(document, 'execCommand');
  });

  afterEach(function() {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  describe('cut', () => {
    xit('should be possible to cut data by keyboard shortcut', () => {
      // simulated keyboard shortcuts doesn't run the true events
    });

    xit('should be possible to cut data by contextMenu option', () => {
      // simulated mouse events doesn't run the true browser event
    });

    it('should be possible to cut data by API', () => {
      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
      });
      const cutEvent = getClipboardEvent();
      const plugin = hot.getPlugin('CopyPaste');

      selectCell(1, 0);

      plugin.onCut(cutEvent);

      expect(cutEvent.clipboardData.getData('text/plain')).toBe('A2');
      /* eslint-disable indent */
      expect(cutEvent.clipboardData.getData('text/html')).toEqual([
        '<meta name="generator" content="Handsontable"/>',
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table>',
          '<tbody>',
            '<tr>',
              '<td>A2</td>',
            '</tr>',
          '</tbody>',
        '</table>',
      ].join(''));
      /* eslint-enable */

      expect(hot.getDataAtCell(1, 0)).toBe(null);
    });

    it('should call beforeCut and afterCut during cutting out operation', () => {
      const beforeCutSpy = jasmine.createSpy('beforeCut');
      const afterCutSpy = jasmine.createSpy('afterCut');

      const hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforeCut: beforeCutSpy,
        afterCut: afterCutSpy,
      });
      const cutEvent = getClipboardEvent();
      const plugin = hot.getPlugin('CopyPaste');

      selectCell(0, 0);

      plugin.onCut(cutEvent);

      expect(beforeCutSpy.calls.argsFor(0)[0].getMetaInfo()).toEqual({
        data: [['A1']],
      });
      expect(afterCutSpy.calls.argsFor(0)[0].getMetaInfo()).toEqual({
        data: [['A1']],
      });
      /* eslint-disable indent */
      expect(cutEvent.clipboardData.getData('text/html')).toBe(
        '<meta name="generator" content="Handsontable"/>' +
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>' +
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td>A1</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );
      /* eslint-enable */
    });
  });
});
