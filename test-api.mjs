const res = await fetch("http://localhost:8001/api/v1/editorial/about"); const data = await res.json(); console.log(JSON.stringify(data, null, 2));
