"""
Test script to verify data_utils.py is returning properly formatted JSON strings
"""
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nuit_info.settings')
django.setup()

from iot import data_utils

print("=" * 80)
print("Testing data_utils.py JSON serialization")
print("=" * 80)

# Test each function
functions = [
    ('Dashboard', data_utils.get_dashboard_data_dict),
    ('Hardware', data_utils.get_hardware_data_dict),
    ('Energy', data_utils.get_energy_data_dict),
    ('Network', data_utils.get_network_data_dict),
    ('Scores', data_utils.get_scores_data_dict),
]

for name, func in functions:
    print(f"\n{name} Data:")
    print("-" * 80)
    try:
        data = func()
        
        # Check if chart_labels is a JSON string
        chart_labels = data.get('chart_labels', '')
        if isinstance(chart_labels, str):
            print(f"✅ chart_labels is a JSON string")
            print(f"   Preview: {chart_labels[:100]}...")
        else:
            print(f"❌ chart_labels is NOT a JSON string (type: {type(chart_labels)})")
        
        # Check other data fields
        for key, value in data.items():
            if key != 'chart_labels' and key != 'latest_data':
                if isinstance(value, str) and key.endswith('_data'):
                    print(f"✅ {key} is a JSON string")
                elif key.startswith('avg_'):
                    print(f"✅ {key} = {value} (numeric average)")
        
        # Check latest_data
        latest_data = data.get('latest_data', [])
        if isinstance(latest_data, list):
            print(f"✅ latest_data is a list with {len(latest_data)} items")
        else:
            print(f"❌ latest_data is NOT a list (type: {type(latest_data)})")
            
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "=" * 80)
print("Test completed!")
print("=" * 80)
