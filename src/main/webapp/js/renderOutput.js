const actionLookup = {
  stop: 0,
  warn: 1,
  go: 2,
};

const severityLookup = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  negligible: 4,
  unknown: 5
}

function gateAction(source, type, val) {
  source = escapeHtml(source);
  var classes = "";
  switch (source.toLowerCase()) {
    case 'stop': {
      classes = 'label-danger';
      break;
    }
    case 'go': {
      classes = 'label-success';
      break;
    }
    case 'warn': {
      classes = 'label-warning';
      break;
    }
  }
  return '<span class="label ' + classes + '">' + source.toUpperCase() + '</span>';
}

function severity(source, type, val) {
  source = escapeHtml(source);
  var classes = "label-default";
  switch (source.toLowerCase()) {
    case 'critical': {
      classes = 'label-danger';
      break;
    }
    case 'high': {
      classes = 'label-warning';
      break;
    }
    case 'medium': {
      classes = 'label-info';
      break;
    }
    case 'low': {
      classes = 'label-success';
      break;
    }
  }
  return '<span class="label ' + classes + '">' + source + '</span>';
}

function buildPolicyEvalTable(tableId, outputFile) {
  jQuery.getJSON(outputFile, function (data) {
    var headers = [];
    var rows = [];
    jQuery.each(data, function (imageId, imageIdObj) {
      if (headers.length === 0) {
        jQuery.each(imageIdObj.result.header, function (i, header) {
          var headerObj = new Object();
          headerObj.title = header.replace('_', ' ');
          headers.push(headerObj);
        });
      }
      jQuery.merge(rows, imageIdObj.result.rows);
    });

    jQuery(document).ready(function () {
      jQuery(tableId).DataTable({
        retrieve: true,
        data: rows,
        columns: headers,
        order: [[6, 'asc']],
        columnDefs: [
          {
            targets: [0, 1, 2],
            render: function (source, type, val) {
              return '<span style="word-break: break-all;">' + renderCell(source) + '</span>';
            }
          },
          {
            targets: [3, 4, 5, 7, 8],
            render: renderCell
          },
          {
            targets: 6,
            render: gateAction
          }
        ]
      });
    });
  });
}

function buildTableFromAnchoreOutput(tableId, outputFile) {
  jQuery.getJSON(outputFile, function (data) {
    var headers = [];
    var rows = [];
    jQuery.each(data, function (imageId, imageIdObj) {
      if (headers.length === 0) {
        jQuery.each(imageIdObj.result.header, function (i, header) {
          var headerObj = new Object();
          headerObj.title = header.replace('_', ' ');
          headers.push(headerObj);
        });
      }
      jQuery.merge(rows, imageIdObj.result.rows);
    });

    jQuery(document).ready(function () {
      jQuery(tableId).DataTable({
        retrieve: true,
        data: rows,
        columns: headers,
        columnDefs: [
          {
            targets: [0, 1, 2, 3, 4, 5],
            render: renderCell
          },
        ]
      });
    });
  });
}

function buildPolicyEvalSummaryTable(tableId, tableObj) {
  jQuery(document).ready(function () {
    jQuery(tableId).DataTable({
      retrieve: true,
      data: tableObj.rows,
      columns: tableObj.header,
      order: [[4, 'asc']],
      columnDefs: [
        {
          targets: 0,
          render: renderCell
        },
        {
          targets: 1,
          render: function (source, type, val) {
            return '<span class="label label-danger">' + escapeHtml(source) + '</span>';
          }
        },
        {
          targets: 2,
          render: function (source, type, val) {
            return '<span class="label label-warning">' + escapeHtml(source) + '</span>';
          }
        },
        {
          targets: 3,
          render: function (source, type, val) {
            return '<span class="label label-success">' + escapeHtml(source) + '</span>';
          }
        },
        {
          targets: 4,
          render: gateAction
        }
      ]
    });
  });
}

function buildSecurityTable(tableId, outputFile) {
  jQuery.getJSON(outputFile, function (tableObj) {
    jQuery(document).ready(function () {
      jQuery(tableId).DataTable({
        retrieve: true,
        data: tableObj.data,
        columns: tableObj.columns,
        order: [[2, 'asc'], [0, 'asc']],
        columnDefs: [
          {
            targets: [0, 1, 3, 4],
            render: renderCell
          },
          {
            targets: 2,
            render: severity
          },
          {
            targets: 5,
            render: renderLinkCell
          }
        ]
      });
    });
  });
}

const LINK_REGEX = /.*>(https?:\/\/)([^<]+)<.*/g;
const URL_REGEX = /(https?:\/\/[^\s)'"<]+)/g;

function renderLinkCell(data) {
  // originally links were embedded in some data, just extract the URL
  if (LINK_REGEX.test(data)) {
    data = data.replace(LINK_REGEX, "$1$2");
  }
  return renderCell(data);
}

function renderCell(data) {
  if (typeof data == "string") {
    data = escapeHtml(data)
    return data.replace(URL_REGEX, '<a href="$1">$1</a>');
  }
  return data;
}

function escapeHtml(text) {
  if (text === undefined || text === null) {
    return "";
  }
  if (typeof text !== "string") {
    return "" + text;
  }
  return text
      .trim()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}
