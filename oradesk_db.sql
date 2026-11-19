-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 17, 2026 at 04:26 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `oradesk_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `auditlog`
--

CREATE TABLE `auditlog` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `device` varchar(191) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `timestamp` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auditlog`
--

INSERT INTO `auditlog` (`id`, `userId`, `action`, `ipAddress`, `device`, `details`, `timestamp`) VALUES
('15076037-3aba-4122-95a6-12b69b68462a', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'LOGIN', '::1', 'Chrome on Windows', 'Signed in on Chrome on Windows (IP: ::1). Previous sessions terminated.', '2026-11-17 05:51:56.308'),
('23538ee6-3292-4cad-bd4b-ff78c2f01f45', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'LOGOUT', '::1', 'Chrome on Windows', 'User signed out from device: Chrome on Windows', '2026-11-17 05:51:40.177'),
('29c6b750-0578-460c-bcb3-10ab03a83afc', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'LOGIN', '::1', 'Chrome on Windows', 'Signed in on Chrome on Windows (IP: ::1). Previous sessions terminated.', '2026-11-17 04:59:47.002'),
('2ae64a02-66b3-4cbb-8db9-b7de2528fc3f', '7a1b7ee2-f1aa-4c57-849d-0adbe6dfb503', 'LOGIN', '::1', 'Chrome on Windows', 'Signed in on Chrome on Windows (IP: ::1). Previous sessions terminated.', '2026-11-17 04:58:31.702'),
('2b2c929e-8599-4513-8faa-3633ce6079cd', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'LOGIN', '::1', 'Chrome on Windows', 'Signed in on Chrome on Windows (IP: ::1). Previous sessions terminated.', '2026-11-17 14:57:25.911'),
('347e9f52-19d0-460f-99a3-88674e0c9791', '7a1b7ee2-f1aa-4c57-849d-0adbe6dfb503', 'LOGOUT', '::1', 'Chrome on Windows', 'User signed out from device: Chrome on Windows', '2026-11-16 17:19:51.838'),
('489684b8-1824-412c-be7a-29cb6d7d2576', '7a1b7ee2-f1aa-4c57-849d-0adbe6dfb503', 'LOGIN', '::1', 'Chrome on Windows', 'Signed in on Chrome on Windows (IP: ::1). Previous sessions terminated.', '2026-11-16 17:13:14.225'),
('55a083f0-aa98-40a6-9e30-02bc527d30c8', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'LOGOUT', '::1', 'Chrome on Windows', 'User signed out from device: Chrome on Windows', '2026-11-17 05:56:04.814'),
('66069628-9fa4-4e6a-844c-5681553a0997', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'LOGIN', '127.0.0.1', 'Chrome on Windows', 'Signed in on Chrome on Windows (IP: 127.0.0.1). Previous sessions terminated.', '2026-11-17 06:53:03.873'),
('707f37fc-ae9d-4625-bf4b-2361943ba8c2', '7a1b7ee2-f1aa-4c57-849d-0adbe6dfb503', 'LOGIN', '::1', 'Chrome on Windows', 'Signed in on Chrome on Windows (IP: ::1). Previous sessions terminated.', '2026-11-17 05:56:26.904'),
('8e672b1e-fd0c-4f4a-8ba3-c5463bfaaa52', '7a1b7ee2-f1aa-4c57-849d-0adbe6dfb503', 'LOGIN', '::1', 'Chrome on Windows', 'Signed in on Chrome on Windows (IP: ::1). Previous sessions terminated.', '2026-11-16 17:39:34.744'),
('928415ee-b9a9-4463-9d5f-df2896043297', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'LOGIN', '::1', 'Chrome on Windows', 'Signed in on Chrome on Windows (IP: ::1). Previous sessions terminated.', '2026-11-17 05:59:54.378'),
('95a6f2de-20ab-442f-8331-49487392f3c8', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'LOGOUT', '::1', 'Chrome on Windows', 'User signed out from device: Chrome on Windows', '2026-11-16 17:39:05.955'),
('9717249a-64a6-462c-bb4a-f9dc7f367d60', '7a1b7ee2-f1aa-4c57-849d-0adbe6dfb503', 'LOGOUT', '::1', 'Chrome on Windows', 'User locked & signed out from device: Chrome on Windows', '2026-11-17 04:59:36.909'),
('97e35214-2b39-459f-b8e5-073085f91508', NULL, 'FAILED_LOGIN', '::1', 'Chrome on Windows', 'Unknown user attempt: \"admin\"', '2026-11-16 17:08:43.882'),
('9aea404b-eba6-4a9a-9f47-7eb6d5396ccb', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'LOGIN', '::1', 'Chrome on Windows', 'Signed in on Chrome on Windows (IP: ::1). Previous sessions terminated.', '2026-11-16 17:42:00.395'),
('9df7f91a-9221-4a6e-84d2-a16d465a7332', NULL, 'FAILED_LOGIN', '::1', 'Chrome on Windows', 'Unknown user attempt: \"DOC-101\"', '2026-11-16 17:09:08.023'),
('bf474be1-7244-4776-813c-401713c511c4', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'LOGIN', '::1', 'Chrome on Windows', 'Signed in on Chrome on Windows (IP: ::1). Previous sessions terminated.', '2026-11-16 17:20:09.710'),
('ce2ca3c9-f7ec-46a7-b352-5d38635370b0', '7a1b7ee2-f1aa-4c57-849d-0adbe6dfb503', 'LOGOUT', '::1', 'Chrome on Windows', 'User locked & signed out from device: Chrome on Windows', '2026-11-16 17:41:45.645'),
('d6fb8ec4-2a0d-4a79-b563-56c2875568d6', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'LOGOUT', '::1', 'Chrome on Windows', 'User signed out from device: Chrome on Windows', '2026-11-17 04:57:00.398'),
('e8081a94-8d08-43de-be0f-0bb69012ca06', NULL, 'FAILED_LOGIN', '::1', 'Chrome on Windows', 'Unknown user attempt: \"DOC-101\"', '2026-11-16 17:09:06.900'),
('ed06527a-85e2-4c80-999a-2f3f334148a4', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'LOGIN', '::1', 'Chrome on Windows', 'Signed in on Chrome on Windows (IP: ::1). Previous sessions terminated.', '2026-11-17 05:34:02.006'),
('ed11a001-b306-4c3d-8e27-a13f6163e79c', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'LOGOUT', '::1', 'Chrome on Windows', 'User signed out from device: Chrome on Windows', '2026-11-17 05:28:31.626'),
('f9ed9031-ed91-4db3-8d50-724396b051cd', '7a1b7ee2-f1aa-4c57-849d-0adbe6dfb503', 'LOGOUT', '::1', 'Chrome on Windows', 'User locked & signed out from device: Chrome on Windows', '2026-11-17 05:59:40.707');

-- --------------------------------------------------------

--
-- Table structure for table `document`
--

CREATE TABLE `document` (
  `collection` varchar(191) NOT NULL,
  `id` varchar(191) NOT NULL,
  `body` longtext NOT NULL,
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document`
--

INSERT INTO `document` (`collection`, `id`, `body`, `updatedAt`) VALUES
('appointments', 'mwka55i8quocw4', '{\"patientId\":\"mwka55i40pbibb\",\"patientName\":\"Rahul Verma\",\"date\":\"2026-11-17\",\"start\":600,\"dur\":45,\"chair\":0,\"reason\":\"Root canal treatment\",\"status\":\"arrived\",\"token\":1,\"example\":true}', '2026-11-17 05:56:47.575'),
('appointments', 'mwka55ibtqi94p', '{\"patientId\":\"mwka55ia75a3h4\",\"patientName\":\"Priya Sharma\",\"date\":\"2026-11-17\",\"start\":660,\"dur\":30,\"chair\":0,\"reason\":\"Scaling and polishing\",\"status\":\"done\",\"token\":2,\"example\":true}', '2026-11-17 05:56:47.575'),
('appointments', 'mwka55icncq2r1', '{\"patientId\":\"mwka55ia75a3h4\",\"patientName\":\"Priya Sharma\",\"date\":\"2026-11-17\",\"start\":1020,\"dur\":30,\"chair\":1,\"reason\":\"Botox\",\"status\":\"booked\",\"token\":3,\"example\":true}', '2026-11-17 05:56:47.575'),
('appointments', 'mwka55idni24gg', '{\"patientId\":\"mwka55ia75a3h4\",\"patientName\":\"Priya Sharma\",\"date\":\"2026-12-01\",\"start\":1020,\"dur\":15,\"chair\":1,\"reason\":\"Botox review\",\"status\":\"booked\",\"token\":1,\"example\":true}', '2026-11-17 05:56:47.575'),
('appointments', 'mwka55iffv0agl', '{\"patientId\":\"mwka55iec2tquq\",\"patientName\":\"Anil Kumar\",\"date\":\"2026-11-17\",\"start\":720,\"dur\":60,\"chair\":1,\"reason\":\"Surgical extraction\",\"status\":\"booked\",\"token\":4,\"example\":true}', '2026-11-17 05:56:47.761'),
('appointments', 'mwka55ih0cvsr5', '{\"patientId\":\"mwka55iggdhvw4\",\"patientName\":\"Sunita Devi\",\"date\":\"2026-11-18\",\"start\":630,\"dur\":30,\"chair\":0,\"reason\":\"Denture trial\",\"status\":\"booked\",\"token\":1,\"example\":true}', '2026-11-17 05:56:47.761'),
('appointments', 'mwka55ildlxqop', '{\"patientId\":\"mwka55ij5z8dc5\",\"patientName\":\"Meera Gupta\",\"date\":\"2026-11-17\",\"start\":960,\"dur\":30,\"chair\":0,\"reason\":\"Implant healing check\",\"status\":\"booked\",\"token\":5,\"example\":true}', '2026-11-17 05:56:47.842'),
('appointments', 'mwka55imtsxbi8', '{\"patientId\":\"mwka55ij5z8dc5\",\"patientName\":\"Meera Gupta\",\"date\":\"2026-11-24\",\"start\":690,\"dur\":30,\"chair\":0,\"reason\":\"Consultation\",\"status\":\"booked\",\"token\":1,\"example\":true}', '2026-11-17 05:56:47.842'),
('lab', 'mwka55iij6xxbh', '{\"patientId\":\"mwka55iggdhvw4\",\"patientName\":\"Sunita Devi\",\"received\":\"\",\"item\":\"Complete denture\",\"tooth\":\"\",\"lab\":\"Smile Dental Lab\",\"shade\":\"A2\",\"sent\":\"2026-11-14\",\"due\":\"2026-11-18\",\"example\":true}', '2026-11-17 05:56:56.981'),
('patients', 'mwka55i40pbibb', '{\"createdAt\":\"2026-11-17T05:56:44.954Z\",\"name\":\"Rahul Verma\",\"phone\":\"98100 00001\",\"age\":\"34\",\"sex\":\"Male\",\"alerts\":\"\",\"notes\":\"Pain on chewing, lower left.\",\"chart\":{\"26\":{\"c\":\"filled\",\"s\":[\"O\"]},\"36\":{\"c\":\"caries\",\"s\":[\"O\",\"D\"]}},\"plan\":[{\"id\":\"mwka55i3rx4pz7\",\"tooth\":\"36\",\"area\":\"\",\"proc\":\"Root canal treatment\",\"stages\":[\"Access opening\",\"Cleaning and shaping\",\"Obturation\",\"Final restoration\"],\"done\":2,\"note\":\"Irreversible pulpitis\",\"addedAt\":\"2026-11-17T05:56:44.954Z\",\"fee\":6500},{\"id\":\"mwka55i3oz6dnd\",\"tooth\":\"36\",\"area\":\"\",\"proc\":\"Crown\",\"stages\":[\"Tooth preparation\",\"Impression\",\"Trial\",\"Cementation\"],\"done\":0,\"note\":\"Metal-ceramic after RCT\",\"addedAt\":\"2026-11-17T05:56:44.954Z\",\"fee\":8000}],\"history\":[{\"id\":\"mwka55i3o7fylb\",\"date\":\"2026-11-10\",\"itemId\":\"mwka55i3rx4pz7\",\"proc\":\"Root canal treatment\",\"tooth\":\"36\",\"area\":\"\",\"stage\":\"Access opening\"},{\"id\":\"mwka55i3gp9yjh\",\"date\":\"2026-11-10\",\"itemId\":\"mwka55i3rx4pz7\",\"proc\":\"Root canal treatment\",\"tooth\":\"36\",\"area\":\"\",\"stage\":\"Cleaning and shaping\"}],\"recall\":null,\"pay\":[{\"id\":\"mwka55i3of1xh0\",\"date\":\"2026-11-10\",\"amt\":3000,\"note\":\"Advance\"}],\"example\":true}', '2026-11-17 05:56:47.575'),
('patients', 'mwka55ia75a3h4', '{\"createdAt\":\"2026-11-17T05:56:44.954Z\",\"name\":\"Priya Sharma\",\"phone\":\"98100 00002\",\"age\":\"28\",\"sex\":\"Female\",\"alerts\":\"\",\"notes\":\"Dental cleaning every 6 months. Also an aesthetics patient.\",\"face\":{\"forehead\":\"lines\",\"glabella\":\"wrinkles\",\"cheekR\":\"pigment\",\"cheekL\":\"pigment\"},\"chart\":{},\"plan\":[{\"id\":\"mwka55i3el3mrf\",\"tooth\":\"\",\"area\":\"\",\"proc\":\"Scaling and polishing\",\"stages\":[],\"done\":1,\"note\":\"\",\"addedAt\":\"2026-11-17T05:56:44.954Z\"},{\"id\":\"mwka55i3x27d30\",\"tooth\":\"\",\"area\":\"forehead\",\"proc\":\"Botox\",\"stages\":[\"Injection\",\"Review at 2 weeks\"],\"done\":0,\"note\":\"Forehead and frown lines\",\"addedAt\":\"2026-11-17T05:56:44.954Z\"},{\"id\":\"mwka55i3kamxfw\",\"tooth\":\"\",\"area\":\"cheekR\",\"proc\":\"Chemical peel\",\"stages\":[\"Session 1\",\"Session 2\",\"Session 3\",\"Session 4\"],\"done\":1,\"note\":\"Mild pigmentation\",\"addedAt\":\"2026-11-17T05:56:44.954Z\"}],\"history\":[{\"id\":\"mwka55i30630c7\",\"date\":\"2026-11-17\",\"itemId\":\"mwka55i3el3mrf\",\"proc\":\"Scaling and polishing\",\"tooth\":\"\",\"stage\":\"\"},{\"id\":\"mwka55i37klmfy\",\"date\":\"2026-11-03\",\"itemId\":\"mwka55i3kamxfw\",\"proc\":\"Chemical peel\",\"tooth\":\"\",\"area\":\"cheekR\",\"stage\":\"Session 1\"}],\"recall\":null,\"example\":true}', '2026-11-17 05:56:47.575'),
('patients', 'mwka55iec2tquq', '{\"createdAt\":\"2026-11-17T05:56:44.954Z\",\"name\":\"Anil Kumar\",\"phone\":\"98100 00003\",\"age\":\"56\",\"sex\":\"Male\",\"alerts\":\"Diabetes, on metformin\",\"notes\":\"Check blood sugar before surgery.\",\"chart\":{\"46\":{\"c\":\"rct\",\"s\":[]},\"48\":{\"c\":\"fracture\",\"s\":[\"O\"]}},\"plan\":[{\"id\":\"mwka55i3honn58\",\"tooth\":\"48\",\"area\":\"\",\"proc\":\"Surgical extraction\",\"stages\":[\"Surgery\",\"Suture removal\"],\"done\":0,\"note\":\"Impacted, mesioangular\",\"addedAt\":\"2026-11-17T05:56:44.954Z\"}],\"history\":[],\"recall\":null,\"example\":true}', '2026-11-17 05:56:47.761'),
('patients', 'mwka55iggdhvw4', '{\"createdAt\":\"2026-11-17T05:56:44.954Z\",\"name\":\"Sunita Devi\",\"phone\":\"98100 00004\",\"age\":\"62\",\"sex\":\"Female\",\"alerts\":\"Takes blood pressure medicine\",\"notes\":\"Upper arch fully edentulous.\",\"chart\":{\"11\":{\"c\":\"missing\",\"s\":[]},\"12\":{\"c\":\"missing\",\"s\":[]},\"13\":{\"c\":\"missing\",\"s\":[]},\"14\":{\"c\":\"missing\",\"s\":[]},\"15\":{\"c\":\"missing\",\"s\":[]},\"16\":{\"c\":\"missing\",\"s\":[]},\"17\":{\"c\":\"missing\",\"s\":[]},\"21\":{\"c\":\"missing\",\"s\":[]},\"22\":{\"c\":\"missing\",\"s\":[]},\"23\":{\"c\":\"missing\",\"s\":[]},\"24\":{\"c\":\"missing\",\"s\":[]},\"25\":{\"c\":\"missing\",\"s\":[]},\"26\":{\"c\":\"missing\",\"s\":[]},\"27\":{\"c\":\"missing\",\"s\":[]}},\"plan\":[{\"id\":\"mwka55i3ency4u\",\"tooth\":\"\",\"area\":\"\",\"proc\":\"Denture\",\"stages\":[\"Impression\",\"Jaw relation\",\"Trial\",\"Delivery\"],\"done\":2,\"note\":\"Upper complete denture\",\"addedAt\":\"2026-11-17T05:56:44.954Z\"}],\"history\":[{\"id\":\"mwka55i3lgxms0\",\"date\":\"2026-11-07\",\"itemId\":\"mwka55i3ency4u\",\"proc\":\"Denture\",\"tooth\":\"\",\"area\":\"\",\"stage\":\"Impression\"},{\"id\":\"mwka55i3uylvlq\",\"date\":\"2026-11-07\",\"itemId\":\"mwka55i3ency4u\",\"proc\":\"Denture\",\"tooth\":\"\",\"area\":\"\",\"stage\":\"Jaw relation\"}],\"recall\":null,\"example\":true}', '2026-11-17 05:56:47.761'),
('patients', 'mwka55ij5z8dc5', '{\"createdAt\":\"2026-11-17T05:56:44.954Z\",\"name\":\"Meera Gupta\",\"phone\":\"98100 00005\",\"age\":\"41\",\"sex\":\"Female\",\"alerts\":\"\",\"notes\":\"Lost 46 two years ago.\",\"chart\":{\"46\":{\"c\":\"implant\",\"s\":[]}},\"plan\":[{\"id\":\"mwka55i41a0gxf\",\"tooth\":\"46\",\"area\":\"\",\"proc\":\"Implant\",\"stages\":[\"Placement\",\"Healing check\",\"Impression\",\"Crown delivery\"],\"done\":1,\"note\":\"Healing well\",\"addedAt\":\"2026-11-17T05:56:44.954Z\"}],\"history\":[{\"id\":\"mwka55i4fa52zk\",\"date\":\"2026-10-18\",\"itemId\":\"mwka55i41a0gxf\",\"proc\":\"Implant\",\"tooth\":\"46\",\"area\":\"\",\"stage\":\"Placement\"}],\"recall\":null,\"example\":true}', '2026-11-17 05:56:47.761'),
('settings', 'clinic', '{\"clinic\":{\"name\":\"OraDesk Clinic\",\"doctor\":\"Dr. Lead Specialist\",\"phone\":\"+91 98765 43210\",\"email\":\"clinic@oradesk.local\",\"address\":\"Suite 101, Medical Enclave\",\"cur\":\"₹\"},\"chairs\":[\"Chair 1\",\"Chair 2\"],\"dayStart\":9,\"dayEnd\":19,\"fees\":{\"Consultation\":500,\"Root Canal Treatment\":3500,\"Composite Restoration\":1200,\"Scaling & Polishing\":1000,\"Crown / Ceramic\":4500,\"Botox 20 Units\":8000,\"Dermal Filler 1ml\":14000}}', '2026-11-16 17:13:09.375'),
('settings', 'main', '{\"aes\":true,\"chairs\":[\"Chair 1\",\"Chair 2\"],\"dayStart\":9,\"dayEnd\":20,\"clinic\":{},\"fin\":true,\"clinicians\":[],\"prices\":{}}', '2026-11-17 05:57:31.162');

-- --------------------------------------------------------

--
-- Table structure for table `metadata`
--

CREATE TABLE `metadata` (
  `key` varchar(191) NOT NULL,
  `value` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `metadata`
--

INSERT INTO `metadata` (`key`, `value`) VALUES
('revision', '10');

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE `session` (
  `id` varchar(191) NOT NULL,
  `sessionToken` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `userAgent` text DEFAULT NULL,
  `deviceLabel` varchar(191) DEFAULT NULL,
  `lastActive` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `session`
--

INSERT INTO `session` (`id`, `sessionToken`, `userId`, `ipAddress`, `userAgent`, `deviceLabel`, `lastActive`, `expiresAt`, `createdAt`) VALUES
('14f5ddee-c8d8-4bc3-a362-fc6ecbf836ba', '1d3f101d8d9dbbaabb27b9022c7e9539d5c0a2be065b574f3cb2ab487095cd81', 'ac303ec3-d283-4f50-960a-3649a5d4ecf7', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.146.0 Chrome/150.0.7871.250 Electron/43.8.6 Safari/537.36', 'Chrome on Windows', '2026-11-17 14:57:25.901', '2027-02-15 14:57:25.901', '2026-11-17 14:57:25.902');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `loginId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'STAFF',
  `plainPasscode` varchar(191) DEFAULT NULL,
  `passcodeHash` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `lastIp` varchar(191) DEFAULT NULL,
  `lastLogin` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `loginId`, `name`, `role`, `plainPasscode`, `passcodeHash`, `isActive`, `lastIp`, `lastLogin`, `createdAt`, `updatedAt`) VALUES
('7a1b7ee2-f1aa-4c57-849d-0adbe6dfb503', 'DOC-101', 'Dr. Clinic Lead', 'DOCTOR', 'DOC-778899', '$2a$10$qnZDL2EnEBo8ihj.klDYS.Gap8xtCm/XwdRhPd3zOB3aUd6Wy67.q', 1, '::1', '2026-11-17 05:56:26.880', '2026-11-16 17:13:09.363', '2026-11-17 05:56:26.898'),
('ac303ec3-d283-4f50-960a-3649a5d4ecf7', 'admin', 'Master Super Admin', 'SUPER_ADMIN', 'SuperAdmin@OraDesk2026', '$2a$10$UEqCPlYnYwb6332shd6/oelyX9n4qJ3OQ5wNBSTGe1Xx70bgIuQfS', 1, '::1', '2026-11-17 14:57:25.901', '2026-11-16 17:13:09.288', '2026-11-17 14:57:25.907');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auditlog`
--
ALTER TABLE `auditlog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `AuditLog_userId_fkey` (`userId`);

--
-- Indexes for table `document`
--
ALTER TABLE `document`
  ADD PRIMARY KEY (`collection`,`id`);

--
-- Indexes for table `metadata`
--
ALTER TABLE `metadata`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Session_sessionToken_key` (`sessionToken`),
  ADD KEY `Session_userId_fkey` (`userId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_loginId_key` (`loginId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auditlog`
--
ALTER TABLE `auditlog`
  ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
