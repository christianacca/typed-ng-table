namespace Glob {

    export interface IPerson {
        age: number;
        name: string;
    }

    export function printPerson(p: IPerson) {
        console.log('age: ' + p.age);
        console.log('name: ' + p.name);
    }
}

// NgTableParams signature tests
namespace Glob.NgTableParamsTests {
    
    import ngtc = NgTable.Core;

    function createNgTable<T>(ctor: ngtc.ITableParamsConstructor<T>, myParams: ngtc.IParamValues<T>, mySettings: ngtc.ISettings<T>) {
        return new ctor(myParams, mySettings);
    }

    let initialParams: ngtc.IParamValues<IPerson> = {
        filter: { name: 'Christian' },
        sorting: { age: 'asc' }
    };
    let settings: ngtc.ISettings<IPerson> = {
        dataset: [{ age: 1, name: 'Christian' }, { age: 2, name: 'Lee' }, { age: 40, name: 'Christian' }],
        filterOptions: {
            filterComparator: true,
            filterDelay: 100
        },
        counts: [10, 20, 50]
    };

    export let tableParams = createNgTable<IPerson>(null as any, initialParams, settings);

    // modify parameters
    tableParams.filter({ name: 'Lee' });
    tableParams.sorting('age', 'desc');
    tableParams.count(10);
    tableParams.group(item => (item.age * 10).toString());

    // modify settings at runtime
    tableParams.settings({
        dataset: [{ age: 1, name: 'Brandon' }, { age: 2, name: 'Lee' }]
    });

    tableParams.reload<IPerson>().then(rows => {
        rows.forEach(printPerson);
    });
}

// Dynamic table column signature tests
namespace Glob.ColumnTests {
    interface ICustomColFields {
        field: string;
    }
    let dynamicCols: (NgTable.Browser.IDynamicTableColDef & ICustomColFields)[];

    dynamicCols.push({
        class: () => 'table',
        field: 'age',
        filter: { age: 'number' },
        sortable: true,
        show: true,
        title: 'Age of Person',
        titleAlt: 'Age'
    });
}

namespace Glob.EventsTests {
    import ngtc = NgTable.Core;
    
    declare let events: NgTable.Events.IEventsChannel;

    let unregistrationFuncs: NgTable.Events.IUnregistrationFunc[] = [];
    let x: NgTable.Events.IUnregistrationFunc;

    x = events.onAfterCreated(params => {
        // do stuff
    });
    unregistrationFuncs.push(x);

    x = events.onAfterReloadData((params, newData, oldData) => {
        newData.forEach(row => {
            if (isDataGroup(row)) {
                row.data.forEach(printPerson)
            } else {
                printPerson(row);
            }
        });
    }, NgTableParamsTests.tableParams);
    unregistrationFuncs.push(x);

    x = events.onDatasetChanged((params, newDataset, oldDataset) => {
        if (newDataset != null) {
            newDataset.forEach(printPerson);
        }
    }, NgTableParamsTests.tableParams);
    unregistrationFuncs.push(x);

    x = events.onPagesChanged((params, newButtons, oldButtons) => {
        newButtons.forEach(printPageButton);
    }, NgTableParamsTests.tableParams);
    unregistrationFuncs.push(x);

    unregistrationFuncs.forEach(f => {
        f();
    });


    function printPageButton(btn: ngtc.IPageButton) {
        console.log('type: ' + btn.type);
        console.log('number: ' + btn['number']);
        console.log('current: ' + btn.current);
        console.log('active: ' + btn.active);
    }

    function isDataGroup(row: any): row is ngtc.IDataRowGroup<any> {
        return ('$hideRows' in row);
    }
}