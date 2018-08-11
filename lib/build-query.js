const { map, compose, join, keys, values, isEmpty, reduce, toPairs } = require('ramda');

const printSubSelect = (table, field) => {
  const isGlue = table.split('_')[0] == 'user';
  var glueId;
  switch (table) {
    case 'companies': glueId = 'company'; break; 
    case 'locations': glueId = 'location'; break; 
    case 'roles': glueId = 'role'; break;
    case 'ratings': glueId = 'rating'; break;
    case 'equipment': glueId = table; break;
    case 'notes': glueId = 'note'; break;
    case 'vehicles': glueId = 'vehicle'; break;
    case 'badges': glueId = 'badge'; break;
    case 'emails': glueId = 'email'; break;
    case 'phones': glueId = 'phone'; break;
    case 'websites': glueId = 'website'; break;
    case 'gallery': glueId = table; break;
  }
  if (isGlue) {
    const unGlue = table.split('_')[1];
    return `(SELECT GROUP_CONCAT(IF(${table}.${field} IS NULL, 'null', ${table}.${field}) SEPARATOR '**')
      FROM ${table} WHERE ${table}.user_id = a.id) AS ${unGlue}_${field}, `;
  } else {
    return `(SELECT GROUP_CONCAT(IF(${table}.${field} IS NULL, 'null', ${table}.${field}) SEPARATOR '**')
      FROM ${table} LEFT JOIN user_${table} ON ${table}.id = user_${table}.${glueId}_id
      WHERE user_${table}.user_id = a.id) AS ${table}_${field}, `;
  }
}

module.exports = {
  get: (company_id = null, access_level = null, user_id = null) => {
    var user_notes_join = '';
    var access_level_join = '';
    var company_join = '';

    if (company_id != null) {
      user_notes_join = `AND j.company_id = ${company_id}`;
      company_join = `(a.public = 1 OR (m.id = ${company_id} AND ${access_level} = 1)`;
      if (user_id != null) {
        company_join += ` OR (a.id = ${user_id})`;
      }
      company_join += `)`
    } else {
      user_notes_join = `AND j.company_id = -1`;
      company_join = `(a.public = 1`;
      if (user_id != null) {
        company_join += ` OR a.id = '${user_id}')`;
      } else {
        company_join += `)`;
      }
    }

    if (access_level != null) {
      access_level_join = `AND ${access_level} = 1`;
    } else {
      access_level_join = `AND 2 = 1`;
    }

    const defaultStmt = `SELECT a.id, a.first_name, a.last_name, a.email, a.phone, a.street_number, a.route, a.city, a.state, a.zip, a.lat, a.lon, a.profile_image, a.bg_image, a.video, a.description, a.organization, a.clients, a.public, a.labor_only, IF(a.password IS NULL OR a.password = '', 0, 1) AS has_password,
    GROUP_CONCAT(DISTINCT m.id) AS companies, 
    GROUP_CONCAT(DISTINCT c.id) AS locations,
    GROUP_CONCAT(DISTINCT e.id) AS roles,
    GROUP_CONCAT(DISTINCT g.id) AS equipment,
    GROUP_CONCAT(DISTINCT h.id) AS ratings,
    GROUP_CONCAT(DISTINCT k.id) AS notes,
    GROUP_CONCAT(DISTINCT o.id) AS vehicles,
    GROUP_CONCAT(DISTINCT q.id) AS badges,
    GROUP_CONCAT(DISTINCT s.id) AS emails,
    GROUP_CONCAT(DISTINCT u.id) AS phones,
    GROUP_CONCAT(DISTINCT w.id) AS websites,
    GROUP_CONCAT(DISTINCT y.id) AS gallery,
    AVG(IF(i.score > -1 AND i.score < 6, i.score, IF(i.score < 0, 0, IF(i.score > 5, 5, 0)))) AS avg_rating
    FROM users AS a
    LEFT JOIN user_locations AS b ON a.id = b.user_id 
    LEFT JOIN locations AS c ON b.location_id = c.id
    LEFT JOIN user_roles AS d ON a.id = d.user_id 
    LEFT JOIN roles AS e ON d.role_id = e.id
    LEFT JOIN user_equipment AS f ON a.id = f.user_id 
    LEFT JOIN equipment AS g ON f.equipment_id = g.id
    LEFT JOIN user_ratings AS h ON a.id = h.user_id 
    LEFT JOIN ratings AS i ON h.rating_id = i.id
    LEFT JOIN user_notes AS j ON a.id = j.user_id ${user_notes_join} ${access_level_join}
    LEFT JOIN notes AS k ON j.note_id = k.id
    LEFT JOIN user_companies AS l ON a.id = l.user_id
    LEFT JOIN companies AS m ON l.company_id = m.id
    LEFT JOIN user_vehicles AS n ON a.id = n.user_id
    LEFT JOIN vehicles AS o ON n.vehicle_id = o.id
    LEFT JOIN user_badges AS p ON a.id = p.user_id
    LEFT JOIN badges AS q ON p.badge_id = q.id
    LEFT JOIN user_emails AS r ON a.id = r.user_id
    LEFT JOIN emails AS s ON r.email_id = s.id
    LEFT JOIN user_phones AS t ON a.id = t.user_id
    LEFT JOIN phones AS u ON t.phone_id = u.id
    LEFT JOIN user_websites AS v ON a.id = v.user_id
    LEFT JOIN websites AS w ON v.website_id = w.id
    LEFT JOIN user_gallery AS x ON a.id = x.user_id
    LEFT JOIN gallery AS y ON x.gallery_id = y.id
    WHERE ${company_join}`;

    return defaultStmt;
  },
  list: (company_id = null, access_level = null, user_id = null) => {
    var user_notes_join = '';
    var access_level_join = '';
    var company_join = '';

    if (company_id != null) {
      user_notes_join = `AND j.company_id = ${company_id}`;
      company_join = `(a.public = 1 OR (m.id = ${company_id} AND ${access_level} = 1)`;
      if (user_id != null) {
        company_join += ` OR (a.id = ${user_id})`;
      }
      company_join += `)`
    } else {
      user_notes_join = `AND j.company_id = -1`;
      company_join = `(a.public = 1`;
      if (user_id != null) {
        company_join += ` OR a.id = '${user_id}')`;
      } else {
        company_join += `)`;
      }
    }

    if (access_level != null) {
      access_level_join = `AND ${access_level} = 1`;
    } else {
      access_level_join = `AND 2 = 1`;
    }

    var defaultStmt = `SELECT a.id, a.first_name, a.last_name, a.profile_image, a.video, a.organization, a.public, a.labor_only, IF(a.password IS NULL OR a.password = '', 0, 1) AS has_password, `;
    
    const data = [
      {companies: ["id", "name"]},
      {locations: ["id", "city", "state", "country", "lat", "lon"]},
      {user_locations: ["creator_id", "company_id"]},
      {roles: ["id", "name", "rate"]},
      {user_roles: ["creator_id", "company_id"]},
      {equipment: ["id", "name"]},
      {user_equipment: ["creator_id", "company_id"]},
      {ratings: ["id", "score"]}, 
      {user_ratings: ["creator_id", "company_id"]},
      {vehicles: ["id", "make", "model", "year"]},
      {badges: ["id", "name"]},
    ];
    data.forEach(function(record, index){
      var table = keys(record)[0];
      var fields = values(record)[0];
      fields.forEach(function(field){
        defaultStmt += printSubSelect(table, field);
      });
    });
    
    defaultStmt += `AVG(IF(i.score > -1 AND i.score < 6, i.score, IF(i.score < 0, 0, IF(i.score > 5, 5, 0)))) AS avg_rating
    FROM users AS a
    LEFT JOIN user_ratings AS h ON a.id = h.user_id 
    LEFT JOIN ratings AS i ON h.rating_id = i.id
    LEFT JOIN user_companies AS l ON a.id = l.user_id
    LEFT JOIN companies AS m ON l.company_id = m.id
    WHERE ${company_join}`;

    return defaultStmt;
  },
  selectWhere: (table, data) => {
    return `SELECT * FROM ${table} WHERE ` +
      compose(
        join(' AND '),
        reduce((acc, val) => acc.concat(`${val[0]} = ?`), []),
        //reduce((acc, val) => acc.concat(`${val[0]} = '${val[1]}'`), []),
        toPairs
      )(data);
  },
  insert: (table, data) => {
    return `INSERT INTO ${table} (` +
      compose(
        join(', '),
        keys
      )(data) +
      ') VALUES (' +
      compose(
        join(', '), 
        map(val => `?`), 
        //map(val => isEmpty(val) ? "'null'" : `'${val}'`), 
        values
      )(data) + ')';
  },
  update: (table, data, where) => {
    return `UPDATE ${table} SET ` +
      compose(
        join(', '),
        reduce((acc, val) => acc.concat(`${val[0]} = ?`), []),
        //reduce((acc, val) => acc.concat(`${val[0]} = '${val[1]}'`), []),
        toPairs
      )(data) +
      ` WHERE ` +
      compose(
        join(' AND '),
        reduce((acc, val) => acc.concat(`${val[0]} = '${val[1]}'`), []),
        toPairs
      )(where);
  },
  escapeValues: (data) => {
    return compose(
      map(val => isEmpty(val) ? null : `${val}`), 
      values
    )(data);
  },
  search: (request, company_id = null, access_level = null) => {
    const tables = keys(request);
    var where = '';
    var alias = '';
    var and = '';
    var user_notes_join = '';
    var access_level_join = '';
    var company_join = '';

    if (company_id != null) {
      user_notes_join = `AND j.company_id = ${company_id}`;
      company_join = `(a.public = 1 OR (m.id = ${company_id} AND ${access_level} = 1)) AND`;
    } else {
      user_notes_join = `AND j.company_id = -1`;
      company_join = `a.public = 1 AND`;
    }

    if (access_level != null) {
      access_level_join = `AND ${access_level} = 1`;
    } else {
      access_level_join = `AND -1 = 1`;
    }
    
    tables.forEach(function(table) {
      keys(request[table]).forEach(function(key, index) {
        const currentField = key;
        const currentValue = values(request[table])[index];

        switch(table) {
          case 'users': alias = 'a'; break;
          case 'locations': alias = 'c'; break;
          case 'roles': alias = 'e'; break;
          case 'equipment': alias = 'g'; break;
          case 'ratings': alias = 'i'; break;
          //case 'notes': alias = 'k'; break;
          case 'vehicles': alias = 'o'; break;
        }

        if (table == 'users') {
          if (currentField == 'full_name') {
            where += ` ${and}LOWER(CONCAT(a.first_name, " ", a.last_name)) LIKE ('%${currentValue.toLowerCase()}%')`;
          } else {
            where += ` ${and}LOWER(${alias}.${currentField}) LIKE ('${currentValue.toLowerCase()}')`;
          }
        } else {
          where += ` ${and}LOWER(${alias}.${currentField}) LIKE ('${currentValue.toLowerCase()}')`;
        }
        and = 'AND ';
      });
    });

    var defaultStmt = `SELECT a.id, a.first_name, a.last_name, a.profile_image, a.video, a.organization, a.public, a.labor_only, IF(a.password IS NULL OR a.password = '', 0, 1) AS has_password, `;
    
    const data = [
      {companies: ["id", "name"]},
      {locations: ["id", "city", "state", "country", "lat", "lon"]},
      {user_locations: ["creator_id", "company_id"]},
      {roles: ["id", "name", "rate"]},
      {user_roles: ["creator_id", "company_id"]},
      {equipment: ["id", "name"]},
      {user_equipment: ["creator_id", "company_id"]},
      {ratings: ["id", "score"]}, 
      {user_ratings: ["creator_id", "company_id"]},
      {vehicles: ["id", "make", "model", "year"]},
      {badges: ["id", "name"]},
    ];
    data.forEach(function(record, index){
      var table = keys(record)[0];
      var fields = values(record)[0];
      fields.forEach(function(field){
        defaultStmt += printSubSelect(table, field);
      });
    });
    
    defaultStmt += `AVG(IF(i.score > -1 AND i.score < 6, i.score, IF(i.score < 0, 0, IF(i.score > 5, 5, 0)))) AS avg_rating
    FROM users AS a
    LEFT JOIN user_locations AS b ON a.id = b.user_id 
    LEFT JOIN locations AS c ON b.location_id = c.id
    LEFT JOIN user_roles AS d ON a.id = d.user_id 
    LEFT JOIN roles AS e ON d.role_id = e.id
    LEFT JOIN user_equipment AS f ON a.id = f.user_id 
    LEFT JOIN equipment AS g ON f.equipment_id = g.id
    LEFT JOIN user_ratings AS h ON a.id = h.user_id 
    LEFT JOIN ratings AS i ON h.rating_id = i.id
    LEFT JOIN user_companies AS l ON a.id = l.user_id
    LEFT JOIN companies AS m ON l.company_id = m.id
    LEFT JOIN user_vehicles AS n ON a.id = n.user_id
    LEFT JOIN vehicles AS o ON n.vehicle_id = o.id
    WHERE ${company_join}`;

    console.log('stmt', defaultStmt + where + ' GROUP BY a.id');
    
    return defaultStmt + where + ' GROUP BY a.id';
  }
}
