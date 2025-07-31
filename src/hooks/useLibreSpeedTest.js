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
// test.setParameter("url_dl", "http://localhost:3000/user/garbage");
// test.setParameter("url_ul", "http://localhost:3000/user/empty");
// test.setParameter("url_ping", "http://localhost:3000/user/empty");
// test.setParameter("url_getIp", "http://localhost:3000/user/getip");
test.setParameter("url_dl", "https://staging-userapi.vacay4me.com/user/garbage");
test.setParameter("url_ul", "https://staging-userapi.vacay4me.com/user/empty");
test.setParameter("url_ping", "https://staging-userapi.vacay4me.com/user/empty");
test.setParameter("url_getIp", "https://staging-userapi.vacay4me.com/user/getip");


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
