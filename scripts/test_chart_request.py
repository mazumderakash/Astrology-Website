import requests, json
payload={'dob':'1995-06-15','tob':'18:30','place':'New Delhi'}
r=requests.post('http://127.0.0.1:5000/api/chart', json=payload, timeout=30)
print('STATUS', r.status_code)
data=r.json()
with open('last_chart_response.json','w',encoding='utf-8') as f:
    json.dump(data,f,ensure_ascii=False,indent=2)
print('WROTE last_chart_response.json')
print('top-level age:', data.get('age'))
print('top-level ayanamsha:', data.get('ayanamsha'))
chart=data.get('chart')
print('chart.age:', chart.get('age') if chart else None)
print('chart.ayanamsha:', chart.get('ayanamsha') if chart else None)
print('chart keys:', list(chart.keys()) if chart else None)
