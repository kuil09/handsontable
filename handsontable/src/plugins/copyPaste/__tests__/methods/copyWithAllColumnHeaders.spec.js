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

  describe('`copyWithAllColumnHeaders` method', () => {
    it('should copy all column headers with cells to the clipboard', () => {
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
          renderers.push((renderedColumnIndex, TH) => {
            TH.innerText = this.getColHeader(renderedColumnIndex, 2);
          });
        },
      });

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      selectCell(1, 0);

      plugin.copyWithAllColumnHeaders();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe('A-0-0\nA-0-1\nA-0-2\nA2');
      /* eslint-disable indent */
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>',
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table>',
          '<thead>',
            '<tr><th>A-0-0</th></tr>',
            '<tr><th>A-0-1</th></tr>',
            '<tr><th>A-0-2</th></tr>',
          '</thead>',
          '<tbody>',
            '<tr><td>A2</td></tr>',
          '</tbody>',
        '</table>',
      ].join(''));
      /* eslint-enable */
    });

    it('should copy all column headers with cells to the clipboard when all cells and headers are selected', () => {
      handsontable({
        data: createSpreadsheetData(2, 3),
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
          renderers.push((renderedColumnIndex, TH) => {
            TH.innerText = this.getColHeader(renderedColumnIndex, 2);
          });
        },
      });

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      selectAll();

      plugin.copyWithAllColumnHeaders();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe([
        'A-0-0\tB-1-0\tC-2-0',
        'A-0-1\tB-1-1\tC-2-1',
        'A-0-2\tB-1-2\tC-2-2',
        'A1\tB1\tC1',
        'A2\tB2\tC2',
      ].join('\n'));
      /* eslint-disable indent */
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>',
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table>',
          '<thead>',
            '<tr><th>A-0-0</th><th>B-1-0</th><th>C-2-0</th></tr>',
            '<tr><th>A-0-1</th><th>B-1-1</th><th>C-2-1</th></tr>',
            '<tr><th>A-0-2</th><th>B-1-2</th><th>C-2-2</th></tr>',
          '</thead>',
          '<tbody>',
            '<tr><td>A1</td><td>B1</td><td>C1</td></tr>',
            '<tr><td>A2</td><td>B2</td><td>C2</td></tr>',
          '</tbody>',
        '</table>',
      ].join(''));
      /* eslint-enable */
    });

    it('should copy cells with all column headers to the clipboard when all rows are hidden', () => {
      const hot = handsontable({
        data: createSpreadsheetData(5, 5),
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

      selectCell(1, 1, 2, 3);

      // hide all rows
      hot.rowIndexMapper.createAndRegisterIndexMap('map', 'hiding', true);
      render();

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      plugin.copyWithAllColumnHeaders();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe([
        'B-1-0\tC-2-0\tD-3-0',
        'B-1-1\tC-2-1\tD-3-1',
        'B2\tC2\tD2',
        'B3\tC3\tD3',
      ].join('\n'));
      /* eslint-disable indent */
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>',
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table>',
          '<thead>',
            '<tr><th>B-1-0</th><th>C-2-0</th><th>D-3-0</th></tr>',
            '<tr><th>B-1-1</th><th>C-2-1</th><th>D-3-1</th></tr>',
          '</thead>',
          '<tbody>',
            '<tr><td>B2</td><td>C2</td><td>D2</td></tr>',
            '<tr><td>B3</td><td>C3</td><td>D3</td></tr>',
          '</tbody>',
        '</table>',
      ].join(''));
      /* eslint-enable */
    });

    it('should copy only cells to the clipboard when all rows are hidden and the `colHeaders` is disabled', () => {
      const hot = handsontable({
        data: createSpreadsheetData(5, 5),
        colHeaders: false,
        copyPaste: true,
      });

      selectCell(1, 1, 2, 3);

      // hide all rows
      hot.rowIndexMapper.createAndRegisterIndexMap('map', 'hiding', true);
      render();

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      plugin.copyWithAllColumnHeaders();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe('B2\tC2\tD2\nB3\tC3\tD3');
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>' +
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table><tbody>',
        '<tr><td>B2</td><td>C2</td><td>D2</td></tr>',
        '<tr><td>B3</td><td>C3</td><td>D3</td></tr>',
        '</tbody></table>',
      ].join(''));
    });

    it('should copy cells with all column headers to the clipboard when all columns are hidden', () => {
      const hot = handsontable({
        data: createSpreadsheetData(5, 5),
        colHeaders: true,
        rowHeaders: true,
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

      selectCell(1, 1, 2, 3);

      // hide all columns
      hot.columnIndexMapper.createAndRegisterIndexMap('map', 'hiding', true);
      render();

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      plugin.copyWithAllColumnHeaders();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe([
        'B-1-0\tC-2-0\tD-3-0',
        'B-1-1\tC-2-1\tD-3-1',
        'B2\tC2\tD2',
        'B3\tC3\tD3',
      ].join('\n'));
      /* eslint-disable indent */
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>',
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table>',
          '<thead>',
            '<tr><th>B-1-0</th><th>C-2-0</th><th>D-3-0</th></tr>',
            '<tr><th>B-1-1</th><th>C-2-1</th><th>D-3-1</th></tr>',
          '</thead>',
          '<tbody>',
            '<tr><td>B2</td><td>C2</td><td>D2</td></tr>',
            '<tr><td>B3</td><td>C3</td><td>D3</td></tr>',
          '</tbody>',
        '</table>',
      ].join(''));
      /* eslint-enable */
    });

    it('should copy only cells to the clipboard when all columns are hidden and the `colHeaders` is disabled', () => {
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

      plugin.copyWithAllColumnHeaders();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe('B2\tC2\tD2\nB3\tC3\tD3');
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>' +
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table><tbody>',
        '<tr><td>B2</td><td>C2</td><td>D2</td></tr>',
        '<tr><td>B3</td><td>C3</td><td>D3</td></tr>',
        '</tbody></table>',
      ].join(''));
    });

    it('should copy all column headers only to the clipboard when all rows are trimmed', () => {
      const hot = handsontable({
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

      selectAll();

      // trim all rows
      hot.rowIndexMapper.createAndRegisterIndexMap('map', 'trimming', true);
      render();

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      plugin.copyWithAllColumnHeaders();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      /* eslint-disable indent */
      expect(copyEvent.clipboardData.getData('text/plain')).toBe([
        'A-0-0\tB-1-0\tC-2-0\tD-3-0\tE-4-0',
        'A-0-1\tB-1-1\tC-2-1\tD-3-1\tE-4-1',
      ].join('\n'));
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>',
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table>',
          '<thead>',
            '<tr><th>A-0-0</th><th>B-1-0</th><th>C-2-0</th><th>D-3-0</th><th>E-4-0</th></tr>',
            '<tr><th>A-0-1</th><th>B-1-1</th><th>C-2-1</th><th>D-3-1</th><th>E-4-1</th></tr>',
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

      plugin.copyWithAllColumnHeaders();
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

      selectAll();

      // trim all columns
      hot.columnIndexMapper.createAndRegisterIndexMap('map', 'trimming', true);
      render();

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      plugin.copyWithAllColumnHeaders();
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

      plugin.copyWithAllColumnHeaders();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      expect(copyEvent.clipboardData.getData('text/plain')).toBe('');
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>' +
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table></table>',
      ].join(''));
    });

    it('should copy nested headers properly', () => {
      handsontable({
        data: [
          ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1'],
          ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2', 'J2'],
        ],
        rowHeaders: true,
        colHeaders: true,
        copyPaste: true,
        nestedHeaders: [
          ['A', { label: 'B', colspan: 8 }, 'C'],
          ['D', { label: 'E', colspan: 4 }, { label: 'F', colspan: 4 }, 'G'],
          [
            'H',
            { label: 'I', colspan: 2 },
            { label: 'J', colspan: 2 },
            { label: 'K', colspan: 2 },
            { label: 'L', colspan: 2 },
            'M'
          ],
          ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'],
        ],
      });

      const copyEvent = getClipboardEvent();
      const plugin = getPlugin('CopyPaste');

      selectAll();

      plugin.copyWithAllColumnHeaders();
      plugin.onCopy(copyEvent); // emulate native "copy" event

      /* eslint-disable no-tabs */
      expect(copyEvent.clipboardData.getData('text/plain')).toBe([
        'A	B								C',
        'D	E				F				G',
        'H	I		J		K		L		M',
        'N	O	P	Q	R	S	T	U	V	W',
        'A1	B1	C1	D1	E1	F1	G1	H1	I1	J1',
        'A2	B2	C2	D2	E2	F2	G2	H2	I2	J2',
      ].join('\n'));
      /* eslint-enable */

      /* eslint-disable indent */
      expect(copyEvent.clipboardData.getData('text/html')).toBe([
        '<meta name="generator" content="Handsontable"/>',
        '<style type="text/css">td{white-space:normal}br{mso-data-placement:same-cell}</style>',
        '<table>',
          '<thead>',
            '<tr>',
              '<th>A</th>',
              '<th colspan=8>B</th>',
              '<th>C</th>',
            '</tr>',
            '<tr>',
              '<th>D</th>',
              '<th colspan=4>E</th>',
              '<th colspan=4>F</th>',
              '<th>G</th>',
            '</tr>',
            '<tr>',
              '<th>H</th>',
              '<th colspan=2>I</th>',
              '<th colspan=2>J</th>',
              '<th colspan=2>K</th>',
              '<th colspan=2>L</th>',
              '<th>M</th>',
            '</tr>',
            '<tr>',
              '<th>N</th>',
              '<th>O</th>',
              '<th>P</th>',
              '<th>Q</th>',
              '<th>R</th>',
              '<th>S</th>',
              '<th>T</th>',
              '<th>U</th>',
              '<th>V</th>',
              '<th>W</th>',
            '</tr>',
          '</thead>',
          '<tbody>',
            '<tr>',
              '<td>A1</td>',
              '<td>B1</td>',
              '<td>C1</td>',
              '<td>D1</td>',
              '<td>E1</td>',
              '<td>F1</td>',
              '<td>G1</td>',
              '<td>H1</td>',
              '<td>I1</td>',
              '<td>J1</td>',
            '</tr>',
            '<tr>',
              '<td>A2</td>',
              '<td>B2</td>',
              '<td>C2</td>',
              '<td>D2</td>',
              '<td>E2</td>',
              '<td>F2</td>',
              '<td>G2</td>',
              '<td>H2</td>',
              '<td>I2</td>',
              '<td>J2</td>',
            '</tr>',
          '</tbody>',
        '</table>'
      ].join(''));
      /* eslint-enable */
    });
  });
});
