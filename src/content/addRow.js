$.fn.addCalculatedCols = function (colOptions) {
    var rowIndex = 0;

    $(this).find('tr').each(function () {
        var tr = $(this);
        var row = [];
        var tdTh = rowIndex == 0 ? 'th' : 'td';

        tr.find(tdTh).each(function () {
            row.push($(this).text());
        });

        var colIndex = 0;
        for (var index in colOptions) {
            var col = colOptions[index];
            var title = col.title;
            var calc = col.calc;
            var add = col.add;
            var value = rowIndex == 0 ? title : parseFloat(calc(row, rowIndex)).toFixed(2)

            var newTd = $('<td>')
                .addClass('addCalc')
                .addClass('text-right')
                .html(value)
            ;

            tr.append(newTd);
            if(add){
                add(newTd, value);
            }
            colIndex++;
        }

        rowIndex++;
    });
};