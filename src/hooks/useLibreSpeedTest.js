import { loadScript } from "@/utils/loadScript";

export const useLibreSpeedTest = (onUpdate, onComplete) => {
  return async () => {
    try {
      

      console.log("🟡 Loading speedtest.js...");
      await loadScript("/librespeed/speedtest.js");
      console.log("✅ LibreSpeed script loaded");
      window.SPEEDTEST_WORKER_PATH = "/librespeed/speedtest_worker.js";

      const test = new window.Speedtest();
      
      test._overrideWorkerPath = "/librespeed/speedtest_worker.js";

      // Override all URLs explicitly
test.setParameter("url_dl", "http://localhost:9090/backend/garbage.php");
test.setParameter("url_ul", "http://localhost:9090/backend/empty.php");
test.setParameter("url_ping", "http://localhost:9090/backend/empty.php");
test.setParameter("url_getIp", "http://localhost:9090/backend/getIP.php");


      test.onupdate = (data) => {
        console.log("🟢 Test update:", data);

        
        onUpdate?.({
          download: data.dlStatus,
          upload: data.ulStatus,
          ping: data.pingStatus,
        });
      };

      test.onend = (data) => {
        console.log("✅ Test complete:", data);
        onComplete?.({
          download: data.dl,
          upload: data.ul,
          ping: data.ping,
        });
      };


      test.start();
      // ✅ THIS STARTS THE TEST WITH CUSTOM SETTINGS
    } catch (err) {
      console.error("❌ Speedtest error:", err);
    }
  };
};
