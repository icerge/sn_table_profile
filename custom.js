var tableNames = 'incident,incident_task';
var excludeUpdatedBy = 'admin,magaly.drant,maint';
var excludeList = generateExcludeUserList(excludeUpdatedBy);
var tableNameArr = tableNames.split(',');
var fieldsArr = [];
for (var i = 0; i < tableNameArr.length; i++) {
    //gather field statistics
    fieldsArr.push(tableNameArr[i] + ';;;;;');
    fieldsArr.push('Custom Fields;;;;;');
    fieldsArr.push('Label;Name;Date;Count;Percent;');
    //statistics calc;
    var fieldsModifiedCount = 0;
    var fieldsTotalCount = 0;
    var totalRecordCount = 0;

    var recordsAGG = new GlideAggregate(tableNameArr[i]);
    recordsAGG.addAggregate('COUNT');
    recordsAGG.query();
    if (recordsAGG.next()) {
        totalRecordCount = recordsAGG.getAggregate('COUNT');
    }

    var dictGR = new GlideRecord('sys_dictionary');
    dictGR.addQuery('name', tableNameArr[i]);
    dictGR.addQuery('element', 'STARTSWITH', 'u_');
    dictGR.addQuery('active', true);
    dictGR.orderBy('column_label');
    dictGR.query();
    fieldsModifiedCount = dictGR.getRowCount();
    while (dictGR.next()) {
        var fieldLabel = dictGR.getValue('column_label');
        var fieldName = dictGR.getValue('element');
        var fieldLastUpdate = '';
        var fieldCount = 0;
        var tableGR = new GlideRecord(tableNameArr[i]);
        tableGR.addNotNullQuery(fieldName);
        tableGR.orderByDesc('sys_updated_on');
        tableGR.setLimit(1);
        tableGR.query();
        if (tableGR.next()) {
            fieldLastUpdate = tableGR.getValue('sys_updated_on');
        }

        var tableAGG = new GlideAggregate(tableNameArr[i]);
        tableAGG.addNotNullQuery(fieldName);
        tableAGG.addAggregate('COUNT');
        tableAGG.query();
        if (tableAGG.next()) {
            fieldCount = tableAGG.getAggregate('COUNT');
        }
        fieldsArr.push(fieldLabel + ';' + fieldName + ';' + fieldLastUpdate + ';' + fieldCount + ';' + getPercent(fieldCount, totalRecordCount) + ';');
    }
    var dictGA = new GlideAggregate('sys_dictionary');
    dictGA.addQuery('name', tableNameArr[i]);
    dictGA.addQuery('active', true);
    dictGA.addAggregate('COUNT');
    dictGA.query();
    if (dictGA.next()) {
        fieldsTotalCount = dictGA.getAggregate('COUNT');
    }

    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Total Record Count;' + totalRecordCount + ';');
    fieldsArr.push(';;;Modified Count;' + fieldsModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + fieldsTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + getPercent(fieldsModifiedCount, fieldsTotalCount) + ';');
    fieldsArr.push(';;;;;');

    //gather ACL info
    fieldsArr.push('ACL;;;;;');
    var aclModifiedCount = 0;
    var aclTotalCount = 0;
    var aclModifiedPercent = 0;
    fieldsArr.push('Name;Operation;Type;Created;Updated;');
    var aclGR = new GlideRecord('sys_security_acl');
    aclGR.addEncodedQuery('name=' + tableNameArr[i] + '^ORnameSTARTSWITH' + tableNameArr[i] + '.' + excludeList + '^active=true');
    aclGR.query();
    while (aclGR.next()) {
        fieldsArr.push(aclGR.getValue('name') + ';' + aclGR.getValue('operation') + ';' + aclGR.getDisplayValue('type') + ';' + aclGR.getValue('sys_created_by') + ';' + aclGR.getValue('sys_updated_by') + ';');
    }
    aclModifiedCount = aclGR.getRowCount();
    var aclAGG = new GlideAggregate('sys_security_acl');
    aclAGG.addEncodedQuery('name=' + tableNameArr[i] + '^ORnameSTARTSWITH' + tableNameArr[i] + '.^active=true');
    aclAGG.addAggregate('COUNT');
    aclAGG.query();
    if (aclAGG.next()) {
        aclTotalCount = aclAGG.getAggregate('COUNT');
    }
    aclModifiedPercent = (parseInt(aclModifiedCount) / parseInt(aclTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + aclModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + aclTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + aclModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //gather Business rules info
    fieldsArr.push('Business Rules;;;;;');
    var brModifiedCount = 0;
    var brTotalCount = 0;
    var brModifiedPercent = 0;
    fieldsArr.push('Name;When;Order;Created;Updated;');
    var brGR = new GlideRecord('sys_script');
    brGR.addEncodedQuery('collection=' + tableNameArr[i] + excludeList + '^active=true');
    brGR.query();
    while (brGR.next()) {
        fieldsArr.push(brGR.getValue('name') + ';' + brGR.getValue('when') + ';' + brGR.getDisplayValue('order') + ';' + brGR.getValue('sys_created_by') + ';' + brGR.getValue('sys_updated_by') + ';');
    }
    brModifiedCount = brGR.getRowCount();
    var brAGG = new GlideAggregate('sys_script');
    brAGG.addEncodedQuery('collection=' + tableNameArr[i] + '^active=true');
    brAGG.addAggregate('COUNT');
    brAGG.query();
    if (brAGG.next()) {
        brTotalCount = brAGG.getAggregate('COUNT');
    }
    brModifiedPercent = (parseInt(brModifiedCount) / parseInt(brTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + brModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + brTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + brModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //gather Client Scripts info
    fieldsArr.push('Client Scripts;;;;;');
    var csModifiedCount = 0;
    var csTotalCount = 0;
    var csModifiedPercent = 0;
    fieldsArr.push('Name;UI Type;Type;Created;Updated;');
    var csGR = new GlideRecord('sys_script_client');
    csGR.addEncodedQuery('table=' + tableNameArr[i] + excludeList + '^active=true');
    csGR.query();
    while (csGR.next()) {
        fieldsArr.push(csGR.getValue('name') + ';' + csGR.getDisplayValue('ui_type') + ';' + csGR.getValue('type') + ';' + csGR.getValue('sys_created_by') + ';' + csGR.getValue('sys_updated_by') + ';');
    }
    csModifiedCount = csGR.getRowCount();
    var csAGG = new GlideAggregate('sys_script_client');
    csAGG.addEncodedQuery('table=' + tableNameArr[i] + '^active=true');
    csAGG.addAggregate('COUNT');
    csAGG.query();
    if (csAGG.next()) {
        csTotalCount = csAGG.getAggregate('COUNT');
    }
    csModifiedPercent = (parseInt(csModifiedCount) / parseInt(csTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + csModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + csTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + csModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //gather ui policies
    fieldsArr.push('UI Policy;;;;;');
    var uiModifiedCount = 0;
    var uiTotalCount = 0;
    var uiModifiedPercent = 0;
    fieldsArr.push('Name;Order;;Created;Updated;');
    var uiGR = new GlideRecord('sys_ui_policy');
    uiGR.addEncodedQuery('table=' + tableNameArr[i] + excludeList + '^active=true');
    uiGR.query();
    while (uiGR.next()) {
        fieldsArr.push(uiGR.getValue('short_description') + ';' + uiGR.getValue('order') + ';' + ';' + uiGR.getValue('sys_created_by') + ';' + uiGR.getValue('sys_updated_by') + ';');
    }
    uiModifiedCount = uiGR.getRowCount();
    var uiAGG = new GlideAggregate('sys_ui_policy');
    uiAGG.addEncodedQuery('table=' + tableNameArr[i] + '^active=true');
    uiAGG.addAggregate('COUNT');
    uiAGG.query();
    if (uiAGG.next()) {
        uiTotalCount = uiAGG.getAggregate('COUNT');
    }
    uiModifiedPercent = (parseInt(uiModifiedCount) / parseInt(uiTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + uiModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + uiTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + uiModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //Data Policy
    fieldsArr.push('Data Policy;;;;;');
    var dpModifiedCount = 0;
    var dpTotalCount = 0;
    var dpModifiedPercent = 0;
    fieldsArr.push('Name;;;Created;Updated;');
    var dpGR = new GlideRecord('sys_data_policy2');
    dpGR.addEncodedQuery('model_table=' + tableNameArr[i] + excludeList + '^active=true');
    dpGR.query();
    while (dpGR.next()) {
        fieldsArr.push(dpGR.getValue('short_description') + ';' + ';' + ';' + dpGR.getValue('sys_created_by') + ';' + dpGR.getValue('sys_updated_by') + ';');
    }
    dpModifiedCount = dpGR.getRowCount();
    var dpAGG = new GlideAggregate('sys_data_policy2');
    dpAGG.addEncodedQuery('model_table=' + tableNameArr[i] + '^active=true');
    dpAGG.addAggregate('COUNT');
    dpAGG.query();
    if (dpAGG.next()) {
        dpTotalCount = dpAGG.getAggregate('COUNT');
    }
    dpModifiedPercent = (parseInt(dpModifiedCount) / parseInt(dpTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + dpModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + dpTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + dpModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //ui actions
    fieldsArr.push('UI Actions;;;;;');
    var uaModifiedCount = 0;
    var uaTotalCount = 0;
    var uaModifiedPercent = 0;
    fieldsArr.push('Name;;;Created;Updated;');
    var uaGR = new GlideRecord('sys_ui_action');
    uaGR.addEncodedQuery('table=' + tableNameArr[i] + excludeList + '^active=true');
    uaGR.query();
    while (uaGR.next()) {
        fieldsArr.push(uaGR.getValue('name') + ';' + ';' + ';' + uaGR.getValue('sys_created_by') + ';' + uaGR.getValue('sys_updated_by') + ';');
    }
    uaModifiedCount = uaGR.getRowCount();
    var uaAGG = new GlideAggregate('sys_ui_action');
    uaAGG.addEncodedQuery('table=' + tableNameArr[i] + '^active=true');
    uaAGG.addAggregate('COUNT');
    uaAGG.query();
    if (uaAGG.next()) {
        uaTotalCount = uaAGG.getAggregate('COUNT');
    }
    uaModifiedPercent = (parseInt(uaModifiedCount) / parseInt(uaTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + uaModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + uaTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + uaModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //Script Includes
    fieldsArr.push('Script Includes;;;;;');
    var siModifiedCount = 0;
    var siTotalCount = 0;
    var siModifiedPercent = 0;
    fieldsArr.push('Name;;;Created;Updated;');
    var siGR = new GlideRecord('sys_script_include');
    siGR.addEncodedQuery('scriptLIKE' + tableNameArr[i] + excludeList + '^active=true');
    siGR.query();
    while (siGR.next()) {
        fieldsArr.push(siGR.getValue('name') + ';' + ';' + ';' + siGR.getValue('sys_created_by') + ';' + siGR.getValue('sys_updated_by') + ';');
    }
    siModifiedCount = siGR.getRowCount();
    var siAGG = new GlideAggregate('sys_script_include');
    siAGG.addEncodedQuery('scriptLIKE' + tableNameArr[i] + '^active=true');
    siAGG.addAggregate('COUNT');
    siAGG.query();
    if (siAGG.next()) {
        siTotalCount = siAGG.getAggregate('COUNT');
    }
    siModifiedPercent = (parseInt(siModifiedCount) / parseInt(siTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + siModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + siTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + siModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //Transform Maps
    fieldsArr.push('Transform Maps;;;;;');
    var tmModifiedCount = 0;
    var tmTotalCount = 0;
    var tmModifiedPercent = 0;
    fieldsArr.push('Name;Source table;;Created;Updated;');
    var tmGR = new GlideRecord('sys_transform_map');
    tmGR.addEncodedQuery('target_table=' + tableNameArr[i] + excludeList + '^active=true');
    tmGR.query();
    while (tmGR.next()) {
        fieldsArr.push(tmGR.getValue('name') + ';' + tmGR.getValue('source_table') + ';' + ';' + tmGR.getValue('sys_created_by') + ';' + tmGR.getValue('sys_updated_by') + ';');
    }
    tmModifiedCount = tmGR.getRowCount();
    var tmAGG = new GlideAggregate('sys_transform_map');
    tmAGG.addEncodedQuery('target_table=' + tableNameArr[i] + '^active=true');
    tmAGG.addAggregate('COUNT');
    tmAGG.query();
    if (tmAGG.next()) {
        tmTotalCount = tmAGG.getAggregate('COUNT');
    }
    tmModifiedPercent = (parseInt(tmModifiedCount) / parseInt(tmTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + tmModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + tmTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + tmModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //Scheduled Jobs
    fieldsArr.push('Scheduled Jobs;;;;;');
    var sjModifiedCount = 0;
    var sjTotalCount = 0;
    var sjModifiedPercent = 0;
    fieldsArr.push('Name;;;Created;Updated;');
    var sjGR = new GlideRecord('sysauto_script');
    sjGR.addEncodedQuery('scriptLIKE' + tableNameArr[i] + excludeList + '^active=true');
    sjGR.query();
    while (sjGR.next()) {
        fieldsArr.push(sjGR.getValue('name') + ';' + ';' + ';' + sjGR.getValue('sys_created_by') + ';' + sjGR.getValue('sys_updated_by') + ';');
    }
    sjModifiedCount = sjGR.getRowCount();
    var sjAGG = new GlideAggregate('sysauto_script');
    sjAGG.addEncodedQuery('scriptLIKE' + tableNameArr[i] + '^active=true');
    sjAGG.addAggregate('COUNT');
    sjAGG.query();
    if (sjAGG.next()) {
        sjTotalCount = sjAGG.getAggregate('COUNT');
    }
    sjModifiedPercent = (parseInt(sjModifiedCount) / parseInt(sjTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + sjModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + sjTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + sjModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //Widget
    fieldsArr.push('Widget;;;;;');
    var wiModifiedCount = 0;
    var wiTotalCount = 0;
    var wiModifiedPercent = 0;
    fieldsArr.push('Name;ID;;Created;Updated;');
    var wiGR = new GlideRecord('sp_widget');
    wiGR.addEncodedQuery('scriptLIKE' + tableNameArr[i] + excludeList);
    wiGR.query();
    while (wiGR.next()) {
        fieldsArr.push(wiGR.getValue('name') + ';' + wiGR.getValue('id') + ';' + ';' + wiGR.getValue('sys_created_by') + ';' + wiGR.getValue('sys_updated_by') + ';');
    }
    wiModifiedCount = wiGR.getRowCount();
    var wiAGG = new GlideAggregate('sp_widget');
    wiAGG.addEncodedQuery('scriptLIKE' + tableNameArr[i]);
    wiAGG.addAggregate('COUNT');
    wiAGG.query();
    if (wiAGG.next()) {
        wiTotalCount = wiAGG.getAggregate('COUNT');
    }
    wiModifiedPercent = (parseInt(wiModifiedCount) / parseInt(wiTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + wiModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + wiTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + wiModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //Relations
    fieldsArr.push('Relations;;;;;');
    var reModifiedCount = 0;
    var reTotalCount = 0;
    var reModifiedPercent = 0;
    fieldsArr.push('Name;Applies to;Queries from;Created;Updated;');
    var reGR = new GlideRecord('sys_relationship');
    reGR.addEncodedQuery('basic_apply_to=' + tableNameArr[i] + '^ORbasic_apply_to' + tableNameArr[i] + excludeList);
    reGR.query();
    while (reGR.next()) {
        fieldsArr.push(reGR.getValue('name') + ';' + reGR.getValue('basic_apply_to') + ';' + reGR.getValue('basic_query_from') + ';' + reGR.getValue('sys_created_by') + ';' + reGR.getValue('sys_updated_by') + ';');
    }
    reModifiedCount = reGR.getRowCount();
    var reAGG = new GlideAggregate('sys_relationship');
    reAGG.addEncodedQuery('basic_apply_to=' + tableNameArr[i] + '^ORbasic_apply_to' + tableNameArr[i]);
    reAGG.addAggregate('COUNT');
    reAGG.query();
    if (reAGG.next()) {
        reTotalCount = reAGG.getAggregate('COUNT');
    }
    reModifiedPercent = (parseInt(reModifiedCount) / parseInt(reTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + reModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + reTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + reModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //UI Page
    fieldsArr.push('UI Page;;;;;');
    var upModifiedCount = 0;
    var upTotalCount = 0;
    var upModifiedPercent = 0;
    fieldsArr.push('Name;;;Created;Updated;');
    var upGR = new GlideRecord('sys_ui_page');
    upGR.addEncodedQuery('123TEXTQUERY321=' + tableNameArr[i] + excludeList);
    upGR.query();
    while (upGR.next()) {
        fieldsArr.push(upGR.getValue('name') + ';' + ';' + ';' + upGR.getValue('sys_created_by') + ';' + upGR.getValue('sys_updated_by') + ';');
    }
    upModifiedCount = upGR.getRowCount();
    var upAGG = new GlideAggregate('sys_ui_page');
    upAGG.addEncodedQuery('123TEXTQUERY321=' + tableNameArr[i]);
    upAGG.addAggregate('COUNT');
    upAGG.query();
    if (upAGG.next()) {
        upTotalCount = upAGG.getAggregate('COUNT');
    }
    upModifiedPercent = (parseInt(upModifiedCount) / parseInt(upTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + upModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + upTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + upModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //Macro
    fieldsArr.push('UI Macro;;;;;');
    var maModifiedCount = 0;
    var maTotalCount = 0;
    var maModifiedPercent = 0;
    fieldsArr.push('Name;;;Created;Updated;');
    var maGR = new GlideRecord('sys_ui_macro');
    maGR.addEncodedQuery('123TEXTQUERY321=' + tableNameArr[i] + excludeList);
    maGR.query();
    while (maGR.next()) {
        fieldsArr.push(maGR.getValue('name') + ';' + ';' + ';' + maGR.getValue('sys_created_by') + ';' + maGR.getValue('sys_updated_by') + ';');
    }
    upModifiedCount = maGR.getRowCount();
    var maAGG = new GlideAggregate('sys_ui_macro');
    maAGG.addEncodedQuery('123TEXTQUERY321=' + tableNameArr[i]);
    maAGG.addAggregate('COUNT');
    maAGG.query();
    if (maAGG.next()) {
        maTotalCount = maAGG.getAggregate('COUNT');
    }
    maModifiedPercent = (parseInt(maModifiedCount) / parseInt(maTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + maModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + maTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + maModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //Events
    fieldsArr.push('Events;;;;;');
    var evModifiedCount = 0;
    var evTotalCount = 0;
    var evModifiedPercent = 0;
    fieldsArr.push('Name;;;Created;Updated;');
    var evGR = new GlideRecord('sysevent_register');
    evGR.addEncodedQuery('table=' + tableNameArr[i] + excludeList);
    evGR.query();
    while (evGR.next()) {
        fieldsArr.push(evGR.getValue('event_name') + ';' + ';' + ';' + evGR.getValue('sys_created_by') + ';' + evGR.getValue('sys_updated_by') + ';');
    }
    evModifiedCount = evGR.getRowCount();
    var evAGG = new GlideAggregate('sysevent_register');
    evAGG.addEncodedQuery('table=' + tableNameArr[i]);
    evAGG.addAggregate('COUNT');
    evAGG.query();
    if (evAGG.next()) {
        evTotalCount = evAGG.getAggregate('COUNT');
    }
    evModifiedPercent = (parseInt(evModifiedCount) / parseInt(evTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + evModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + evTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + evModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //Script Actions
    fieldsArr.push('Script Actions;;;;;');
    var saModifiedCount = 0;
    var saTotalCount = 0;
    var saModifiedPercent = 0;
    fieldsArr.push('Name;;;Created;Updated;');
    var saGR = new GlideRecord('sysevent_script_action');
    saGR.addEncodedQuery('123TEXTQUERY321=' + tableNameArr[i] + excludeList);
    saGR.query();
    while (saGR.next()) {
        fieldsArr.push(saGR.getValue('name') + ';' + ';' + ';' + saGR.getValue('sys_created_by') + ';' + saGR.getValue('sys_updated_by') + ';');
    }
    saModifiedCount = saGR.getRowCount();
    var saAGG = new GlideAggregate('sysevent_script_action');
    saAGG.addEncodedQuery('123TEXTQUERY321=' + tableNameArr[i]);
    saAGG.addAggregate('COUNT');
    saAGG.query();
    if (saAGG.next()) {
        saTotalCount = saAGG.getAggregate('COUNT');
    }
    saModifiedPercent = (parseInt(saModifiedCount) / parseInt(saTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + saModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + saTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + saModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //Inbound Email Actions
    fieldsArr.push('Inbound Email Actions;;;;;');
    var ieaModifiedCount = 0;
    var ieaTotalCount = 0;
    var ieaModifiedPercent = 0;
    fieldsArr.push('Name;;;Created;Updated;');
    var ieaGR = new GlideRecord('sysevent_in_email_action');
    ieaGR.addEncodedQuery('123TEXTQUERY321=' + tableNameArr[i] + excludeList);
    ieaGR.query();
    while (ieaGR.next()) {
        fieldsArr.push(ieaGR.getValue('name') + ';' + ';' + ';' + ieaGR.getValue('sys_created_by') + ';' + ieaGR.getValue('sys_updated_by') + ';');
    }
    ieaModifiedCount = ieaGR.getRowCount();
    var ieaAGG = new GlideAggregate('sysevent_in_email_action');
    ieaAGG.addEncodedQuery('123TEXTQUERY321=' + tableNameArr[i]);
    ieaAGG.addAggregate('COUNT');
    ieaAGG.query();
    if (ieaAGG.next()) {
        ieaTotalCount = ieaAGG.getAggregate('COUNT');
    }
    ieaModifiedPercent = (parseInt(ieaModifiedCount) / parseInt(ieaTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + ieaModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + ieaTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + ieaModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //Record Producers
    fieldsArr.push('Inbound Email Actions;;;;;');
    var rpModifiedCount = 0;
    var rpTotalCount = 0;
    var rpModifiedPercent = 0;
    fieldsArr.push('Name;;;Created;Updated;');
    var rpGR = new GlideRecord('sc_cat_item_producer');
    rpGR.addEncodedQuery('123TEXTQUERY321=' + tableNameArr[i] + excludeList);
    rpGR.query();
    while (rpGR.next()) {
        fieldsArr.push(rpGR.getValue('name') + ';' + ';' + ';' + rpGR.getValue('sys_created_by') + ';' + rpGR.getValue('sys_updated_by') + ';');
    }
    rpModifiedCount = rpGR.getRowCount();
    var rpAGG = new GlideAggregate('sc_cat_item_producer');
    rpAGG.addEncodedQuery('123TEXTQUERY321=' + tableNameArr[i]);
    rpAGG.addAggregate('COUNT');
    rpAGG.query();
    if (rpAGG.next()) {
        rpTotalCount = rpAGG.getAggregate('COUNT');
    }
    rpModifiedPercent = (parseInt(rpModifiedCount) / parseInt(rpTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + rpModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + rpTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + rpModifiedPercent + ';');
    fieldsArr.push(';;;;;');

    //Catalog Items
    fieldsArr.push('Catalog Items;;;;;');
    var catModifiedCount = 0;
    var catTotalCount = 0;
    var catModifiedPercent = 0;
    fieldsArr.push('Name;;;Created;Updated;');
    var catGR = new GlideRecord('sc_cat_item');
    catGR.addEncodedQuery('123TEXTQUERY321=' + tableNameArr[i] + excludeList);
    catGR.query();
    while (catGR.next()) {
        fieldsArr.push(catGR.getValue('name') + ';' + ';' + ';' + catGR.getValue('sys_created_by') + ';' + catGR.getValue('sys_updated_by') + ';');
    }
    catModifiedCount = catGR.getRowCount();
    var catAGG = new GlideAggregate('sc_cat_item');
    catAGG.addEncodedQuery('123TEXTQUERY321=' + tableNameArr[i]);
    catAGG.addAggregate('COUNT');
    catAGG.query();
    if (catAGG.next()) {
        catTotalCount = catAGG.getAggregate('COUNT');
    }
    catModifiedPercent = (parseInt(catModifiedCount) / parseInt(catTotalCount)) * 100;
    fieldsArr.push(';;;Statistics;;');
    fieldsArr.push(';;;Modified Count;' + catModifiedCount + ';');
    fieldsArr.push(';;;Total Count;' + catTotalCount + ';');
    fieldsArr.push(';;;Customization %;' + catModifiedPercent + ';');
    fieldsArr.push(';;;;;');
}

gs.info('[ak] ' + fieldsArr.toString());

function generateExcludeUserList(userStr) {
    var userArr = userStr.split(',');
    var resultStr = '';
    for (var i = 0; i < userArr.length; i++) {
        resultStr += '^sys_updated_by!=' + userArr[i] + '^ORsys_updated_by=NULL';
    }
    return resultStr;
}

function getPercent(modified, total) {
    return (parseInt(modified) / parseInt(total)) * 100;
}