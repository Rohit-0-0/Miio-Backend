const { createClient } = require('@sanity/client'); 
const client = createClient({ projectId: 'jvblp287', dataset: 'development', useCdn: false, apiVersion: '2024-01-01' }); 
client.fetch('*[_type == "property"]{id, slug, title, guestyId}').then(console.log).catch(console.error);
