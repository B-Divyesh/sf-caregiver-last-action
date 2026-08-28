# Demo sandbox

Open `/demo` or `/?demo=1` for three realistic sample care actions for Mila.
The banner says “Demo — sample data, nothing is saved.” It provides **Reset demo**
and **Start for real**. Demo uses the `demo:caregiver-last-action` IndexedDB
database and `demo:cla_device_id` local-storage key. It never reads or writes
the real database or key. Demo tabs use their own broadcast channel. A sample
board can pair only with another sample board, never a real board. The service
worker precaches `/demo`, so the sample works offline after the first visit.
