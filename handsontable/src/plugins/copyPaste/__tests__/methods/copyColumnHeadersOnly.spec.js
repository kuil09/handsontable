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

  describe('`copyColumnHeadersOnly` method', () => {
    it('should copy only the most-bottom column headers to the clipboard', () => {
      handsontable({
        data: createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        copyPaste: true,
        modifyColumnHeaderValue(value, columnIndex, headerLevel) {
          if (headerLevel < 0) {
            headerLevel = headerLevel + this.view.getColumnHeadersCount();
          }

          return `${value}-${columnIndex}-${headerLevel}`;
        },
        afterGetColumnHeaderRenderers(renderers) {
          renderers.length = 0;
          renderers.push((renderedColumnIndex, TH) => {
            TH.innerText = this.getColHeader(renderedColumnIndex, 0);
          });
          renderers.push((renderedColumnIndex, TH) => {
            TH.innerText = this.getColHeader(renderedColumnIndex, 1);
          });
        },
      });

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      selectCell(1, 1);

      plugin.copyColumnHeadersOnly();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe('B-1-1');
      /* eslint-disable indent */
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>',
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table>',
          '<thead>',
            '<tr><th>B-1-1</th></tr>',
          '</thead>',
        '</table>',
      ].join(''));
      /* eslint-enable */
    });

    it('should copy only the most-bottom column headers when all cells are selected', () => {
      handsontable({
        data: createSpreadsheetData(4, 4),
        rowHeaders: true,
        colHeaders: true,
        copyPaste: true,
        modifyColumnHeaderValue(value, columnIndex, headerLevel) {
          if (headerLevel < 0) {
            headerLevel = headerLevel + this.view.getColumnHeadersCount();
          }

          return `${value}-${columnIndex}-${headerLevel}`;
        },
        afterGetColumnHeaderRenderers(renderers) {
          renderers.length = 0;
          renderers.push((renderedColumnIndex, TH) => {
            TH.innerText = this.getColHeader(renderedColumnIndex, 0);
          });
          renderers.push((renderedColumnIndex, TH) => {
            TH.innerText = this.getColHeader(renderedColumnIndex, 1);
          });
        },
      });

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      selectAll();

      plugin.copyColumnHeadersOnly();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe('A-0-1\tB-1-1\tC-2-1\tD-3-1');
      /* eslint-disable indent */
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>',
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table>',
          '<thead>',
            '<tr><th>A-0-1</th><th>B-1-1</th><th>C-2-1</th><th>D-3-1</th></tr>',
          '</thead>',
        '</table>',
      ].join(''));
      /* eslint-enable */
    });

    it('should copy only the most-bottom column headers when all rows are hidden', () => {
      const hot = handsontable({
        data: createSpreadsheetData(5, 5),
        colHeaders: true,
        rowHeaders: true,
        copyPaste: true,
      });

      selectCell(1, 1, 2, 3);

      // hide all rows
      hot.rowIndexMapper.createAndRegisterIndexMap('map', 'hiding', true);
      render();

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      plugin.copyColumnHeadersOnly();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe('B\tC\tD');
      /* eslint-disable indent */
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>',
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table>',
          '<thead>',
            '<tr><th>B</th><th>C</th><th>D</th></tr>',
          '</thead>',
        '</table>',
      ].join(''));
      /* eslint-enable */
    });

    it('should copy an empty string to the clipboard when all rows are hidden and the `colHeaders` is disabled', () => {
      const hot = handsontable({
        data: createSpreadsheetData(5, 5),
        colHeaders: false,
        rowHeaders: true,
        copyPaste: true,
      });

      selectCell(1, 1, 2, 3);

      // hide all rows
      hot.rowIndexMapper.createAndRegisterIndexMap('map', 'hiding', true);
      render();

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      plugin.copyColumnHeadersOnly();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe('');
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>' +
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table></table>',
      ].join(''));
    });

    it('should copy most-bottom hidden column headers to the clipboard when all columns are hidden', () => {
      const hot = handsontable({
        data: createSpreadsheetData(5, 5),
        colHeaders: true,
        rowHeaders: true,
        copyPaste: true,
      });

      selectCell(1, 1, 2, 3);

      // hide all columns
      hot.columnIndexMapper.createAndRegisterIndexMap('map', 'hiding', true);
      render();

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      plugin.copyColumnHeadersOnly();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe('B\tC\tD');
      /* eslint-disable indent */
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>' +
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table>',
          '<thead>',
            '<tr><th>B</th><th>C</th><th>D</th></tr>',
          '</thead>',
        '</table>',
      ].join(''));
      /* eslint-enable */
    });

    it('should copy an empty string to the clipboard when all columns are hidden and the `colHeaders` is disabled', () => {
      const hot = handsontable({
        data: createSpreadsheetData(5, 5),
        colHeaders: false,
        rowHeaders: true,
        copyPaste: true,
      });

      selectCell(1, 1, 2, 3);

      // hide all columns
      hot.columnIndexMapper.createAndRegisterIndexMap('map', 'hiding', true);
      render();

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      plugin.copyColumnHeadersOnly();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe('');
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>' +
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table></table>',
      ].join(''));
    });

    it('should copy most-bottom column headers to the clipboard when all rows are trimmed', () => {
      const hot = handsontable({
        data: createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        copyPaste: true,
      });

      selectAll();

      // trim all rows
      hot.rowIndexMapper.createAndRegisterIndexMap('map', 'trimming', true);
      render();

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      plugin.copyColumnHeadersOnly();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      /* eslint-disable indent */
      expect(copyEvent.clipboardData.getData('text/plain')).toBe('A\tB\tC\tD\tE');
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>',
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table>',
          '<thead>',
            '<tr><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th></tr>',
          '</thead>',
        '</table>',
      ].join(''));
      /* eslint-enable */
    });

    it('should copy an empty string to the clipboard when all rows are trimmed and the `colHeaders` is disabled', () => {
      const hot = handsontable({
        data: createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: false,
        copyPaste: true,
      });

      selectAll();

      // trim all rows
      hot.rowIndexMapper.createAndRegisterIndexMap('map', 'trimming', true);
      render();

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      plugin.copyColumnHeadersOnly();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe('');
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>' +
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table></table>',
      ].join(''));
    });

    it('should copy an empty string to the clipboard when all columns are trimmed', () => {
      const hot = handsontable({
        data: createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        copyPaste: true,
      });

      selectAll();

      // trim all columns
      hot.columnIndexMapper.createAndRegisterIndexMap('map', 'trimming', true);
      render();

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      plugin.copyColumnHeadersOnly();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe('');
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>' +
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table></table>',
      ].join(''));
    });

    it('should copy an empty string to the clipboard when all columns are trimmed and the `colHeaders` is disabled', () => {
      const hot = handsontable({
        data: createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: false,
        copyPaste: true,
      });

      selectAll();

      // trim all columns
      hot.columnIndexMapper.createAndRegisterIndexMap('map', 'trimming', true);
      render();

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      plugin.copyColumnHeadersOnly();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe('');
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>' +
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table></table>',
      ].join(''));
    });
  });
});
