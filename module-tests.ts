import { IDataRowGroup, INgTableParams, IPageButton, IParamValues, ISettings, ITableParamsConstructor } from 'ng-table/core';
import { IDynamicTableColDef } from 'ng-table/browser';
import { IEventsChannel, IUnregistrationFunc } from 'ng-table/events'

namespace Mod {
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
namespace Mod.NgTableParamsTests {

    function createNgTable<T>(ctor: ITableParamsConstructor<T>, myParams: IParamValues<T>, mySettings: ISettings<T>) {
        return new ctor(myParams, mySettings);
    }

    let initialParams: IParamValues<IPerson> = {
        filter: { name: 'Christian' },
        sorting: { age: 'asc' }
    };
    let settings: ISettings<IPerson> = {
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
namespace Mod.ColumnTests {
    interface ICustomColFields {
        field: string;
    }
    let dynamicCols: (IDynamicTableColDef & ICustomColFields)[];

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

namespace Mod.EventsTests {
    declare let events: IEventsChannel;

    let unregistrationFuncs: IUnregistrationFunc[] = [];
    let x: IUnregistrationFunc;

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


    function printPageButton(btn: IPageButton) {
        console.log('type: ' + btn.type);
        console.log('number: ' + btn['number']);
        console.log('current: ' + btn.current);
        console.log('active: ' + btn.active);
    }

    function isDataGroup(row: any): row is IDataRowGroup<any> {
        return ('$hideRows' in row);
    }
}