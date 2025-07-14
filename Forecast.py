from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import requests
from statsmodels.tsa.arima.model import ARIMA

app = Flask(__name__)
CORS(app)

@app.route('/forecast', methods=['GET'])
def forecast():
    try:
        # Fetch historical sales data from Laravel
        response = requests.get("http://localhost:8000/api/historical-sales")
        data = response.json()

        # Validate historical data
        if not data or len(data) < 6:
            return jsonify({"error": "Insufficient historical data."}), 400

        # Prepare the DataFrame
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)
        ts = df['total_qty'].astype(float)

        # Fit the ARIMA model
        model = ARIMA(ts, order=(1, 1, 1))
        model_fit = model.fit()

        # Forecast 30 days ahead
        forecast = model_fit.forecast(steps=30)
        forecast_dates = pd.date_range(start=ts.index[-1] + pd.Timedelta(days=1), periods=30)

        # Create response
        result = [{"date": str(date.date()), "predicted_qty": int(qty)} for date, qty in zip(forecast_dates, forecast)]

        # ✅ Return named key "forecast" so React can read it properly
        return jsonify({"forecast": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
