/**
 * Library Management System Logic
 * Features:
 * - Data Persistence (LocalStorage)
 * - CRUD Books
 * - Borrow/Return Logic
 * - Search Filter
 * - Stats, Toasts, Activity Log
 * - [NEW] Authentication System (Login/Register)
 */

const STORAGE_KEY_BOOKS = 'library_books';
const STORAGE_KEY_LOGS = 'library_logs';
const STORAGE_KEY_USERS = 'library_users';
const STORAGE_KEY_SESSION = 'library_session';
const STORAGE_KEY_VERSION = 'library_data_version';
const DATA_VERSION = 3; // Increment this when initialBooks changes to force refresh

// --------------------------------------------------------------------------
// 1. Data Models 
// --------------------------------------------------------------------------

class Book {
    constructor(id, name, author, category, image = null, description = null, content = null, pdf = null) {
        this.id = id;
        this.name = name;
        this.author = author;
        this.category = category;
        this.image = image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=50`;
        this.description = description || 'Chưa có mô tả cho cuốn sách này.';
        this.content = content || '<p>Nội dung đang cập nhật... Vui lòng quay lại sau.</p>';
        this.pdf = pdf; // New PDF property
        this.status = 'Còn'; // 'Còn' or 'Đang mượn'
        this.borrower = null;
        this.borrowDate = null;
    }
}

// Initial Books Data - Extended with pages for PDF-like reading
const bookPages = {
    literatura: [
        '<h2>Lời Mở Đầu</h2><p>Văn học là tấm gương phản chiếu tâm hồn con người, là cầu nối giữa các thế hệ và nền văn hóa. Qua từng trang sách, chúng ta được sống nhiều cuộc đời, trải nghiệm muôn vàn cảm xúc mà có lẽ cả đời ta không thể nếm trải hết.</p><p>Văn học Việt Nam có bề dày lịch sử hàng nghìn năm, từ ca dao, tục ngữ đến những áng văn chương hiện đại. Mỗi tác phẩm đều mang trong mình những giá trị nhân văn sâu sắc, phản ánh hiện thực xã hội và khát vọng của con người.</p><p>Hãy cùng bước vào thế giới của những câu chuyện bất hủ, nơi mà mỗi nhân vật, mỗi tình huống đều chứa đựng bài học quý giá cho cuộc sống...</p>',
        '<h2>Chương 1: Khởi Đầu</h2><p>Ngày xưa, trong một ngôi làng nhỏ ven sông Hồng, có một cậu bé mồ côi tên là An. Cậu sống với bà ngoại trong căn nhà tranh đơn sơ nhưng ấm áp tình thương. Bà ngoại tuy nghèo khó nhưng luôn dạy An những điều tốt đẹp trong cuộc sống.</p><p>Mỗi buổi sáng, khi tiếng gà gáy vang lên báo hiệu bình minh, An thức dậy phụ bà quét sân, nấu cơm. Cậu bé chăm chỉ và hiếu thảo, được cả làng yêu mến.</p><p>"Cháu ơi, người tốt thì trời không phụ. Dù nghèo nhưng mình sống cho tử tế thì sẽ gặp điều tốt đẹp." - Bà ngoại thường nói với An như vậy.</p><p>Những lời dạy của bà đã in sâu vào tâm trí cậu bé, trở thành kim chỉ nam cho cả cuộc đời sau này...</p>',
        '<h2>Chương 2: Hành Trình Tìm Cha</h2><p>Năm An tròn mười lăm tuổi, bà ngoại lâm bệnh nặng. Trước khi nhắm mắt, bà trao cho An một bức thư đã ố vàng theo thời gian và nói: "Đây là thư của mẹ con. Cha con vẫn còn sống, ở một nơi rất xa. Hãy đi tìm cha, cháu nhé."</p><p>Sau khi lo tang cho bà, An gói ghém vài bộ quần áo, mấy củ khoai luộc vào chiếc túi vải cũ. Cậu cầm bức thư áp vào ngực, bước ra khỏi làng khi mặt trời vừa ló dạng.</p><p>Con đường phía trước dài và xa tít tắp. Có những lúc An mệt mỏi muốn bỏ cuộc, nhưng nghĩ đến lời bà dặn, cậu lại gắng gượng bước tiếp. "Dù thế nào cháu cũng phải tìm được cha. Đó là nguyện vọng cuối cùng của bà." - An tự nhủ.</p>',
        '<h2>Chương 3: Gặp Gỡ Bạn Đường</h2><p>Trên đường đi, An gặp được nhiều người tốt. Đầu tiên là Minh - cậu bé chăn trâu vui tính cùng trang lứa. Minh sống ở làng bên kia sông, tuy nghịch ngợm nhưng rất tốt bụng và nghĩa khí.</p><p>"Tao đi với mày! Một mình đi xa nguy hiểm lắm." - Minh nói chắc nịch khi nghe An kể về hành trình tìm cha.</p><p>Hai cậu bé còn gặp Lan - cô gái bán hoa xinh đẹp, con của bà lão tốt bụng cho họ trú mưa qua đêm. Và cả lão tiều phu sống trong rừng sâu, người đã cứu họ khi bị lạc đường.</p><p>Mỗi người An gặp đều dạy cho cậu một bài học. Minh dạy cậu về tình bạn và lòng dũng cảm. Lan dạy cậu về sự nhẹ nhàng và tình người. Lão tiều phu dạy cậu về sự kiên nhẫn và trí tuệ của người đi trước...</p>',
        '<h2>Chương 4: Thử Thách</h2><p>Hành trình không hề dễ dàng. Có lần, cả nhóm bị bọn cướp chặn đường cướp hết đồ đạc. Có lúc phải nhịn đói mấy ngày liền vì không kiếm được việc làm. Có khi phải ngủ ngoài trời giữa đêm đông giá rét.</p><p>Nhưng khó khăn nhất là khi Minh bị ốm nặng giữa đường. An phải cõng bạn đi tìm thầy thuốc, làm thuê làm mướn kiếm tiền mua thuốc. Suốt một tháng trời chăm bạn, An gầy đi trông thấy.</p><p>"Mày bỏ tao lại đi đi. Tao không muốn làm chậm bước của mày." - Minh nói trong cơn sốt.</p><p>"Không! Mày là bạn tao. Tao không bao giờ bỏ rơi bạn." - An đáp chắc nịch.</p><p>Lòng trung thành và tình bạn của An đã cảm động cả trời xanh. Minh dần khỏe lại, và họ tiếp tục cuộc hành trình...</p>',
        '<h2>Chương 5: Gặp Lại Cha</h2><p>Sau hơn một năm rong ruổi, cuối cùng An cũng tìm đến được ngôi làng trong bức thư. Đó là một làng nhỏ ở vùng trung du, nằm dựa lưng vào dãy núi xanh thẳm.</p><p>Khi An hỏi thăm người tên trong thư, một ông lão chỉ vào ngôi trường làng phía cuối đường. An chạy như bay đến đó. Trong lớp học đơn sơ, một người đàn ông trung niên đang dạy lũ trẻ đánh vần.</p><p>Nhìn thấy An, người đàn ông sững người. Đôi mắt ông đỏ hoe. "An... con trai của cha... có phải là con không?" - Ông run rẩy hỏi.</p><p>"Dạ, con là An. Con tìm cha suốt hơn một năm trời..." - An không nói được nữa vì nước mắt đã trào ra.</p><p>Hai cha con ôm nhau khóc nức nở. Những giọt nước mắt của hạnh phúc, của đoàn tụ sau bao năm xa cách...</p>',
        '<h2>Chương 6: Sự Thật</h2><p>Tối hôm đó, cha kể cho An nghe câu chuyện năm xưa. Cha vốn là một thầy giáo nghèo, yêu mẹ An tha thiết. Nhưng vì gia cảnh khác biệt, hai người không được chấp nhận.</p><p>Khi mẹ mang thai, cha bị ép phải rời làng. Cha đau khổ vô cùng nhưng không còn cách nào khác. Cha đến đây, tiếp tục nghề dạy học, và chờ đợi ngày được gặp lại con.</p><p>"Cha xin lỗi con. Cha đã không thể ở bên con những ngày thơ ấu. Cha đã không thể chăm sóc mẹ con khi mẹ bệnh." - Cha nghẹn ngào.</p><p>"Không sao đâu cha. Bây giờ cha con mình đã ở bên nhau rồi. Đó là điều quan trọng nhất." - An ôm cha, lòng tràn ngập hạnh phúc.</p>',
        '<h2>Chương 7: Cuộc Sống Mới</h2><p>An ở lại sống với cha, phụ giúp cha dạy học cho trẻ em trong làng. Minh cũng ở lại, trở thành một nông dân giỏi giang. Hai người bạn vẫn thân thiết như xưa.</p><p>Mỗi đêm, An thường ngồi ngoài hiên nhìn trăng và nghĩ về bà ngoại. Cậu tin rằng trên thiên đường, bà đang mỉm cười hạnh phúc khi thấy cháu mình đã tìm được cha.</p><p><strong>Bài học cuộc sống:</strong></p><ul><li>Gia đình là điều quý giá nhất, luôn đáng để ta nỗ lực vì nó.</li><li>Tình bạn chân thành giúp ta vượt qua mọi khó khăn.</li><li>Kiên trì và không bỏ cuộc sẽ đưa ta đến đích.</li><li>Lòng tốt sẽ được đền đáp bằng những điều tốt đẹp.</li></ul><p><em>~ Hết ~</em></p>'
    ],
    tinHoc: [
        '<h2>Giới Thiệu Về Tin Học</h2><p>Chào mừng bạn đến với thế giới kỳ diệu của Công nghệ Thông tin! Trong thời đại số ngày nay, tin học không còn là một môn học xa lạ mà đã trở thành kỹ năng thiết yếu cho mọi người.</p><p>Cuốn sách này sẽ đưa bạn từ những kiến thức cơ bản nhất đến những kỹ năng nâng cao, giúp bạn tự tin làm chủ công nghệ.</p><p><strong>Bạn sẽ học được:</strong></p><ul><li>Hiểu về cấu tạo và hoạt động của máy tính</li><li>Làm quen với các ngôn ngữ lập trình phổ biến</li><li>Xây dựng website và ứng dụng đầu tiên</li><li>Tư duy giải quyết vấn đề như một lập trình viên</li></ul>',
        '<h2>Chương 1: Máy Tính Và Các Thành Phần</h2><p>Máy tính là thiết bị điện tử có khả năng xử lý thông tin theo các chương trình được lập trình sẵn. Để hiểu máy tính, ta cần biết về các thành phần chính:</p><p><strong>1. CPU (Central Processing Unit)</strong></p><p>CPU là "bộ não" của máy tính, nơi thực hiện mọi phép tính và xử lý dữ liệu. Tốc độ CPU được đo bằng GHz (Gigahertz). CPU càng mạnh, máy tính xử lý càng nhanh.</p><p><strong>2. RAM (Random Access Memory)</strong></p><p>RAM là bộ nhớ tạm, lưu trữ dữ liệu đang được xử lý. Khi tắt máy, dữ liệu trong RAM sẽ bị xóa. RAM càng lớn, bạn càng có thể chạy nhiều chương trình cùng lúc.</p><p><strong>3. Ổ Cứng (HDD/SSD)</strong></p><p>Ổ cứng lưu trữ dữ liệu vĩnh viễn: hệ điều hành, phần mềm, tài liệu, ảnh, video... SSD nhanh hơn HDD rất nhiều nhưng giá thành cao hơn.</p>',
        '<h2>Chương 2: Hệ Điều Hành</h2><p>Hệ điều hành (Operating System - OS) là phần mềm quan trọng nhất, quản lý toàn bộ phần cứng và phần mềm của máy tính.</p><p><strong>Các hệ điều hành phổ biến:</strong></p><ul><li><strong>Windows:</strong> Của Microsoft, phổ biến nhất thế giới, dễ sử dụng</li><li><strong>macOS:</strong> Của Apple, thiết kế đẹp, bảo mật cao</li><li><strong>Linux:</strong> Mã nguồn mở, miễn phí, được lập trình viên yêu thích</li></ul><p><strong>Chức năng của hệ điều hành:</strong></p><ul><li>Quản lý bộ nhớ và CPU</li><li>Điều khiển các thiết bị ngoại vi (chuột, bàn phím, màn hình)</li><li>Quản lý file và thư mục</li><li>Cung cấp giao diện người dùng</li><li>Bảo mật hệ thống</li></ul>',
        '<h2>Chương 3: Ngôn Ngữ Lập Trình</h2><p>Ngôn ngữ lập trình là "ngôn ngữ" để giao tiếp với máy tính, ra lệnh cho máy thực hiện các tác vụ cụ thể.</p><p><strong>Các ngôn ngữ phổ biến:</strong></p><p><strong>Python</strong> - Dễ học nhất, cú pháp rõ ràng:</p><pre><code>print("Xin chào Việt Nam!")\nten = "An"\nprint(f"Tên tôi là {ten}")</code></pre><p><strong>JavaScript</strong> - Ngôn ngữ của web:</p><pre><code>console.log("Hello World!");\nlet tuoi = 18;\nalert("Tuổi của bạn: " + tuoi);</code></pre><p><strong>HTML/CSS</strong> - Xây dựng giao diện web:</p><pre><code>&lt;h1&gt;Tiêu đề&lt;/h1&gt;\n&lt;p&gt;Đoạn văn bản&lt;/p&gt;</code></pre>',
        '<h2>Chương 4: Thuật Toán Cơ Bản</h2><p>Thuật toán là tập hợp các bước có thứ tự để giải quyết một vấn đề. Một thuật toán tốt cần:</p><ul><li><strong>Tính đúng đắn:</strong> Cho kết quả chính xác</li><li><strong>Tính hiệu quả:</strong> Thực thi nhanh, ít tốn tài nguyên</li><li><strong>Tính rõ ràng:</strong> Dễ hiểu, dễ bảo trì</li></ul><p><strong>Ví dụ: Thuật toán tìm số lớn nhất trong 3 số</strong></p><pre><code>1. Nhập 3 số a, b, c\n2. Gán max = a\n3. Nếu b > max thì max = b\n4. Nếu c > max thì max = c\n5. In ra max</code></pre><p><strong>Các thuật toán quan trọng cần biết:</strong> Sắp xếp (Bubble Sort, Quick Sort), Tìm kiếm (Linear Search, Binary Search), Đệ quy...</p>',
        '<h2>Chương 5: Lập Trình Web</h2><p>Web là nền tảng phổ biến nhất ngày nay. Một website được xây dựng từ 3 công nghệ chính:</p><p><strong>1. HTML (HyperText Markup Language)</strong></p><p>Xác định cấu trúc và nội dung trang web:</p><pre><code>&lt;!DOCTYPE html&gt;\n&lt;html&gt;\n  &lt;head&gt;\n    &lt;title&gt;Tiêu đề&lt;/title&gt;\n  &lt;/head&gt;\n  &lt;body&gt;\n    &lt;h1&gt;Xin chào!&lt;/h1&gt;\n  &lt;/body&gt;\n&lt;/html&gt;</code></pre><p><strong>2. CSS (Cascading Style Sheets)</strong></p><p>Tạo giao diện đẹp mắt: màu sắc, font chữ, bố cục...</p><p><strong>3. JavaScript</strong></p><p>Thêm tính năng tương tác: click, hiệu ứng, xử lý dữ liệu...</p>',
        '<h2>Chương 6: Cơ Sở Dữ Liệu</h2><p>Cơ sở dữ liệu (Database) là nơi lưu trữ dữ liệu có tổ chức, cho phép truy xuất và quản lý hiệu quả.</p><p><strong>Các loại cơ sở dữ liệu:</strong></p><ul><li><strong>SQL (Relational Database):</strong> MySQL, PostgreSQL, Oracle - Dữ liệu lưu trong bảng, có quan hệ với nhau</li><li><strong>NoSQL:</strong> MongoDB, Redis - Linh hoạt, phù hợp dữ liệu lớn</li></ul><p><strong>Câu lệnh SQL cơ bản:</strong></p><pre><code>-- Lấy tất cả học sinh\nSELECT * FROM hocsinh;\n\n-- Lấy học sinh lớp 12A1\nSELECT * FROM hocsinh\nWHERE lop = \'12A1\';</code></pre>',
        '<h2>Chương 7: Lời Kết & Lộ Trình Học</h2><p>Chúc mừng bạn đã hoàn thành phần kiến thức cơ bản! Dưới đây là lộ trình gợi ý để tiếp tục học:</p><p><strong>Bước 1: Nền tảng (1-2 tháng)</strong></p><ul><li>Hoàn thành một khóa học Python hoặc JavaScript</li><li>Làm 5-10 bài tập thuật toán đơn giản mỗi tuần</li></ul><p><strong>Bước 2: Chuyên sâu (2-4 tháng)</strong></p><ul><li>Chọn lĩnh vực: Web, Mobile, Data Science, AI...</li><li>Học công nghệ tương ứng</li></ul><p><strong>Bước 3: Thực hành (Liên tục)</strong></p><ul><li>Xây dựng dự án cá nhân</li><li>Tham gia cộng đồng lập trình viên</li><li>Đọc code của người khác, học hỏi từ họ</li></ul><p><em>Nhớ rằng: Lập trình là kỹ năng cần thực hành liên tục. Đừng ngại mắc lỗi - đó là cách tốt nhất để học!</em></p>'
    ],
    kyNang: [
        '<h2>Lời Tựa: Hành Trình Phát Triển Bản Thân</h2><p>Cuộc sống không đợi bạn sẵn sàng. Mỗi ngày trôi qua là một cơ hội để trở nên tốt hơn phiên bản ngày hôm qua. Cuốn sách này sẽ trang bị cho bạn những kỹ năng thiết yếu để thành công trong cuộc sống và sự nghiệp.</p><p><strong>Bạn sẽ học được:</strong></p><ul><li>Quản lý thời gian hiệu quả</li><li>Giao tiếp thuyết phục</li><li>Tư duy tích cực và giải quyết vấn đề</li><li>Xây dựng thói quen thành công</li><li>Cân bằng cuộc sống và công việc</li></ul><p><em>"Thành công không phải là đích đến, mà là hành trình. Và hành trình bắt đầu từ những thay đổi nhỏ mỗi ngày."</em></p>',
        '<h2>Chương 1: Nghệ Thuật Quản Lý Thời Gian</h2><p>Thời gian là tài sản quý giá nhất, một khi mất đi không bao giờ lấy lại được. Vậy làm sao để sử dụng thời gian hiệu quả?</p><p><strong>1. Phương pháp Pomodoro</strong></p><ul><li>Làm việc tập trung 25 phút</li><li>Nghỉ 5 phút</li><li>Sau 4 vòng, nghỉ dài 15-30 phút</li></ul><p><strong>2. Ma trận Eisenhower</strong></p><p>Phân loại công việc theo 4 nhóm:</p><ul><li><strong>Quan trọng + Gấp:</strong> Làm ngay</li><li><strong>Quan trọng + Không gấp:</strong> Lên lịch làm</li><li><strong>Không quan trọng + Gấp:</strong> Ủy quyền nếu có thể</li><li><strong>Không quan trọng + Không gấp:</strong> Loại bỏ</li></ul><p><strong>3. Quy tắc 2 phút:</strong> Nếu việc gì mất dưới 2 phút, làm ngay thay vì ghi vào danh sách.</p>',
        '<h2>Chương 2: Kỹ Năng Giao Tiếp Hiệu Quả</h2><p>Nghiên cứu cho thấy kỹ năng giao tiếp quyết định 85% thành công trong sự nghiệp. Không chỉ nói, mà còn là lắng nghe và thấu hiểu.</p><p><strong>1. Lắng nghe chủ động</strong></p><ul><li>Tập trung hoàn toàn vào người nói</li><li>Không ngắt lời, không vội phán xét</li><li>Đặt câu hỏi để hiểu rõ hơn</li><li>Tóm tắt lại để xác nhận đã hiểu đúng</li></ul><p><strong>2. Ngôn ngữ cơ thể</strong></p><ul><li>Duy trì giao tiếp mắt (nhưng đừng nhìn chằm chằm)</li><li>Mỉm cười tự nhiên</li><li>Tư thế cởi mở (không khoanh tay)</li><li>Gật đầu để thể hiện đang lắng nghe</li></ul><p><strong>3. Nói chuyện hiệu quả</strong></p><ul><li>Rõ ràng, ngắn gọn, đi thẳng vào vấn đề</li><li>Dùng "tôi" thay vì "bạn" khi góp ý</li><li>Khen ngợi chân thành trước khi góp ý</li></ul>',
        '<h2>Chương 3: Tư Duy Tích Cực</h2><p>Thái độ quyết định hạnh phúc và thành công của bạn. Cùng một sự kiện, người có tư duy tích cực sẽ nhìn thấy cơ hội, trong khi người tiêu cực chỉ thấy vấn đề.</p><p><strong>Cách rèn luyện tư duy tích cực:</strong></p><p><strong>1. Viết nhật ký biết ơn</strong></p><p>Mỗi tối, viết 3 điều bạn biết ơn trong ngày. Đó có thể là điều rất nhỏ: bữa ăn ngon, nụ cười của bạn bè, hay thời tiết đẹp...</p><p><strong>2. Đổi góc nhìn</strong></p><p>Thay vì than "Sao mình khổ thế?", hãy hỏi "Mình học được gì từ việc này?"</p><p><strong>3. Tránh xa sự tiêu cực</strong></p><ul><li>Hạn chế tin tiêu cực trên mạng xã hội</li><li>Tránh những người hay than vãn, phàn nàn</li><li>Bao quanh mình bằng những người tích cực</li></ul><p><em>"Bạn không thể thay đổi gió, nhưng bạn có thể điều chỉnh cánh buồm."</em></p>',
        '<h2>Chương 4: Xây Dựng Thói Quen Thành Công</h2><p>Chúng ta là sản phẩm của những thói quen. Thói quen tốt sẽ đưa ta đến thành công, thói quen xấu sẽ kéo ta xuống.</p><p><strong>Công thức 21-90:</strong></p><ul><li>21 ngày để tạo thói quen</li><li>90 ngày để biến nó thành lối sống</li></ul><p><strong>Thói quen buổi sáng của người thành công:</strong></p><ol><li><strong>5:00:</strong> Thức dậy sớm</li><li><strong>5:00-5:30:</strong> Thiền định hoặc tập thể dục</li><li><strong>5:30-6:00:</strong> Đọc sách hoặc học điều mới</li><li><strong>6:00-6:30:</strong> Lên kế hoạch cho ngày</li><li><strong>6:30-7:00:</strong> Ăn sáng lành mạnh</li></ol><p><strong>Mẹo duy trì thói quen:</strong></p><ul><li>Bắt đầu nhỏ (5 phút mỗi ngày)</li><li>Gắn với thói quen có sẵn</li><li>Theo dõi tiến trình</li><li>Thưởng cho bản thân khi đạt mốc</li></ul>',
        '<h2>Chương 5: Kỹ Năng Giải Quyết Vấn Đề</h2><p>Vấn đề là điều không thể tránh khỏi trong cuộc sống. Điều quan trọng là cách bạn đối mặt và giải quyết chúng.</p><p><strong>Quy trình giải quyết vấn đề 5 bước:</strong></p><ol><li><strong>Xác định vấn đề:</strong> Vấn đề thực sự là gì? Đừng nhầm lẫn triệu chứng với nguyên nhân gốc.</li><li><strong>Thu thập thông tin:</strong> Lắng nghe từ nhiều nguồn, tìm hiểu bối cảnh.</li><li><strong>Đưa ra các giải pháp:</strong> Brainstorm tất cả khả năng, đừng vội phán xét.</li><li><strong>Chọn giải pháp tốt nhất:</strong> Đánh giá ưu nhược điểm của từng phương án.</li><li><strong>Thực hiện và đánh giá:</strong> Hành động và điều chỉnh nếu cần.</li></ol><p><strong>Tư duy "Yes, and..."</strong></p><p>Thay vì nói "Không được vì...", hãy nói "Được, và chúng ta cần thêm..." Điều này mở ra khả năng thay vì đóng lại cánh cửa.</p>',
        '<h2>Chương 6: Sức Khỏe Tinh Thần</h2><p>Sức khỏe tinh thần quan trọng không kém sức khỏe thể chất. Một tâm hồn khỏe mạnh là nền tảng cho mọi thành công.</p><p><strong>Dấu hiệu căng thẳng cần chú ý:</strong></p><ul><li>Mất ngủ hoặc ngủ quá nhiều</li><li>Dễ cáu gắt, mất kiên nhẫn</li><li>Khó tập trung</li><li>Cảm thấy kiệt sức dù không làm nhiều</li></ul><p><strong>Cách giảm căng thẳng:</strong></p><ol><li><strong>Thiền định:</strong> Chỉ 10 phút mỗi ngày có thể giảm stress đáng kể</li><li><strong>Tập thể dục:</strong> Giải phóng endorphin, hormone hạnh phúc</li><li><strong>Ngủ đủ giấc:</strong> 7-8 tiếng mỗi đêm</li><li><strong>Kết nối xã hội:</strong> Gặp gỡ bạn bè, gia đình</li><li><strong>Sở thích:</strong> Dành thời gian cho điều bạn yêu thích</li></ol>',
        '<h2>Chương 7: Lời Kết - Hành Động Ngay Hôm Nay</h2><p>Kiến thức không có giá trị nếu không được áp dụng. Đừng chỉ đọc xong rồi quên. Hãy hành động!</p><p><strong>Bài tập thực hành:</strong></p><ol><li>Chọn 1 thói quen mới và cam kết thực hiện trong 21 ngày</li><li>Viết nhật ký biết ơn mỗi tối</li><li>Áp dụng Pomodoro cho công việc/học tập</li><li>Thực hành lắng nghe chủ động trong mọi cuộc trò chuyện</li></ol><p><strong>Lời nhắn:</strong></p><p><em>Thành công không đến trong một đêm. Đó là kết quả của hàng ngàn nỗ lực nhỏ mỗi ngày. Đừng so sánh mình với người khác, hãy so sánh với chính mình ngày hôm qua.</em></p><p><em>Bạn có khả năng làm được những điều phi thường. Hãy tin vào bản thân và bắt đầu hành trình ngay hôm nay!</em></p><p>🎯 <strong>Chúc bạn thành công!</strong></p>'
    ],
    khoaHoc: [
        '<h2>Khám Phá Vũ Trụ Bao La</h2><p>Vũ trụ là tất cả những gì tồn tại - không gian, thời gian, vật chất và năng lượng. Vũ trụ có tuổi khoảng 13.8 tỷ năm, bắt đầu từ vụ nổ Big Bang.</p><p><strong>Những con số ấn tượng:</strong></p><ul><li>Vũ trụ quan sát được có đường kính khoảng 93 tỷ năm ánh sáng</li><li>Chứa khoảng 2 nghìn tỷ (2,000,000,000,000) thiên hà</li><li>Mỗi thiên hà có hàng trăm tỷ ngôi sao</li><li>Trái Đất chỉ là một hạt cát trong đại dương vô tận này</li></ul><p><strong>Thiên hà Ngân Hà của chúng ta:</strong></p><p>Chúng ta sống trong thiên hà Milky Way (Ngân Hà), một thiên hà xoắn ốc với khoảng 200-400 tỷ ngôi sao. Mặt Trời của chúng ta chỉ là một trong số đó!</p>',
        '<h2>Chương 1: Hệ Mặt Trời</h2><p>Hệ Mặt Trời là "ngôi nhà" của chúng ta trong vũ trụ, gồm Mặt Trời và 8 hành tinh quay quanh nó.</p><p><strong>Các hành tinh (theo thứ tự từ gần đến xa Mặt Trời):</strong></p><ol><li><strong>Sao Thủy (Mercury):</strong> Nhỏ nhất, gần Mặt Trời nhất, nhiệt độ dao động -180°C đến 430°C</li><li><strong>Sao Kim (Venus):</strong> Nóng nhất (462°C), được gọi là "sao Mai" hoặc "sao Hôm"</li><li><strong>Trái Đất (Earth):</strong> Hành tinh duy nhất có sự sống, 71% bề mặt là nước</li><li><strong>Sao Hỏa (Mars):</strong> "Hành tinh đỏ", có thể có nước đóng băng, mục tiêu khám phá tương lai</li><li><strong>Sao Mộc (Jupiter):</strong> Lớn nhất, có Vết Đỏ Lớn - cơn bão khổng lồ</li><li><strong>Sao Thổ (Saturn):</strong> Nổi tiếng với hệ thống vành đai tuyệt đẹp</li><li><strong>Sao Thiên Vương (Uranus):</strong> Nghiêng gần 90°, như quay "nằm ngang"</li><li><strong>Sao Hải Vương (Neptune):</strong> Xa nhất, có gió mạnh nhất hệ Mặt Trời</li></ol>',
        '<h2>Chương 2: Ánh Sáng Và Tốc Độ</h2><p>Ánh sáng là dạng bức xạ điện từ mà mắt người có thể nhìn thấy. Nó có những tính chất kỳ diệu:</p><p><strong>Tốc độ ánh sáng:</strong></p><ul><li>Khoảng 300,000 km/giây (299,792,458 m/s chính xác)</li><li>Nhanh nhất trong vũ trụ - không gì vượt qua được</li><li>Ánh sáng từ Mặt Trời mất 8 phút 20 giây để đến Trái Đất</li><li>Từ ngôi sao gần nhất (Proxima Centauri) mất 4.24 năm!</li></ul><p><strong>Năm ánh sáng là gì?</strong></p><p>Là khoảng cách ánh sáng đi được trong 1 năm, khoảng 9.46 nghìn tỷ km. Dùng để đo khoảng cách trong vũ trụ vì km quá nhỏ.</p><p><strong>Phổ ánh sáng:</strong></p><p>Ánh sáng trắng thực ra gồm 7 màu: Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím - tạo nên cầu vồng!</p>',
        '<h2>Chương 3: Sinh Vật Học - Bí Ẩn Sự Sống</h2><p>Sự sống trên Trái Đất là điều kỳ diệu. Từ vi khuẩn nhỏ xíu đến cá voi xanh khổng lồ, tất cả đều có chung một nền tảng.</p><p><strong>Tế bào - Đơn vị cơ bản của sự sống</strong></p><ul><li>Mọi sinh vật đều được cấu tạo từ tế bào</li><li>Cơ thể người có khoảng 37 nghìn tỷ tế bào</li><li>Tế bào nhỏ nhất: vi khuẩn Mycoplasma (0.2 micromet)</li><li>Tế bào lớn nhất: trứng đà điểu (15cm)</li></ul><p><strong>DNA - Mã di truyền của sự sống</strong></p><ul><li>DNA chứa tất cả thông tin để tạo ra một sinh vật</li><li>DNA người có 3 tỷ cặp base</li><li>Nếu duỗi thẳng DNA trong một tế bào, nó dài khoảng 2 mét!</li><li>Con người chia sẻ 98.8% DNA với tinh tinh, 85% với chuột, thậm chí 60% với chuối!</li></ul>',
        '<h2>Chương 4: Vật Lý - Các Định Luật Cơ Bản</h2><p>Vật lý học giải thích cách vũ trụ hoạt động, từ hạt nhỏ nhất đến thiên hà lớn nhất.</p><p><strong>Ba định luật Newton:</strong></p><ol><li><strong>Định luật 1 (Quán tính):</strong> Vật đứng yên sẽ đứng yên, vật chuyển động sẽ tiếp tục chuyển động thẳng đều nếu không có lực tác dụng.</li><li><strong>Định luật 2:</strong> F = m × a (Lực = Khối lượng × Gia tốc)</li><li><strong>Định luật 3:</strong> Mọi lực tác dụng đều có phản lực bằng và ngược chiều.</li></ol><p><strong>Năng lượng:</strong></p><ul><li>Năng lượng không tự sinh ra hoặc mất đi, chỉ chuyển hóa từ dạng này sang dạng khác</li><li>E = mc² (Công thức nổi tiếng của Einstein về mối quan hệ giữa khối lượng và năng lượng)</li></ul>',
        '<h2>Chương 5: Hóa Học - Nguyên Tố Và Phản Ứng</h2><p>Mọi vật chất đều được tạo thành từ các nguyên tố hóa học. Có 118 nguyên tố trong bảng tuần hoàn.</p><p><strong>Các nguyên tố phổ biến:</strong></p><ul><li><strong>Hydrogen (H):</strong> Nhẹ nhất, chiếm 75% khối lượng vũ trụ</li><li><strong>Oxygen (O):</strong> Cần cho hô hấp, chiếm 21% không khí</li><li><strong>Carbon (C):</strong> Nền tảng của sự sống, có trong mọi sinh vật</li><li><strong>Nitrogen (N):</strong> Chiếm 78% không khí</li></ul><p><strong>Nước (H₂O):</strong></p><p>Phân tử đơn giản nhưng kỳ diệu nhất:</p><ul><li>2 nguyên tử Hydrogen + 1 nguyên tử Oxygen</li><li>Duy nhất tồn tại cả 3 dạng (rắn, lỏng, khí) ở điều kiện tự nhiên</li><li>Chiếm 60% cơ thể người</li></ul>',
        '<h2>Chương 6: Bảo Vệ Môi Trường</h2><p>Trái Đất đang đối mặt với nhiều thách thức môi trường nghiêm trọng. Mỗi người chúng ta đều có trách nhiệm bảo vệ hành tinh này.</p><p><strong>Các vấn đề môi trường:</strong></p><ul><li><strong>Biến đổi khí hậu:</strong> Nhiệt độ tăng 1.1°C so với thời tiền công nghiệp</li><li><strong>Ô nhiễm:</strong> Không khí, nước, đất đang bị ô nhiễm nghiêm trọng</li><li><strong>Mất đa dạng sinh học:</strong> 1 triệu loài đang đối mặt nguy cơ tuyệt chủng</li><li><strong>Rác thải nhựa:</strong> 8 triệu tấn nhựa đổ ra đại dương mỗi năm</li></ul><p><strong>Chúng ta có thể làm gì?</strong></p><ul><li>Tiết kiệm điện, nước</li><li>Sử dụng phương tiện công cộng hoặc xe đạp</li><li>Giảm, tái sử dụng, tái chế (3R)</li><li>Ăn ít thịt hơn (chăn nuôi gây 14.5% khí thải)</li><li>Trồng cây xanh</li></ul>',
        '<h2>Chương 7: Tương Lai Khoa Học</h2><p>Khoa học đang phát triển với tốc độ chóng mặt. Nhiều điều tưởng như khoa học viễn tưởng đang dần trở thành hiện thực.</p><p><strong>Những đột phá đang diễn ra:</strong></p><ul><li><strong>Trí tuệ nhân tạo (AI):</strong> Máy tính có thể học và ra quyết định</li><li><strong>Y học tái tạo:</strong> Nuôi cấy cơ quan trong phòng thí nghiệm</li><li><strong>Năng lượng sạch:</strong> Năng lượng mặt trời, gió, hạt nhân fusion</li><li><strong>Du hành vũ trụ:</strong> SpaceX, NASA đang chuẩn bị đưa người lên Sao Hỏa</li></ul><p><strong>Lời kết:</strong></p><p>Khoa học là công cụ mạnh mẽ nhất của nhân loại. Nó giúp chúng ta hiểu vũ trụ, chữa bệnh, và giải quyết các vấn đề toàn cầu.</p><p><em>"Điều kỳ diệu nhất là vũ trụ có thể hiểu được." - Albert Einstein</em></p><p>Hãy luôn tò mò, đặt câu hỏi, và không ngừng học hỏi!</p>'
    ]
};

const initialBooks = [
    // Tin học
    new Book('BK001', 'HTML & CSS Căn Bản', 'Jon Duckett', 'Tin học', 'https://m.media-amazon.com/images/I/31b4K-hFH-L._SX342_SY445_.jpg', 'Sách nhập môn tuyệt vời về Web Design, hướng dẫn chi tiết từ cơ bản đến nâng cao.', JSON.stringify(bookPages.tinHoc)),
    new Book('BK005', 'Clean Code', 'Robert C. Martin', 'Tin học', 'https://m.media-amazon.com/images/I/41xShlnTZTL._SX342_SY445_.jpg', 'Kinh thánh cho lập trình viên muốn viết code sạch và chuyên nghiệp.', JSON.stringify(bookPages.tinHoc)),
    new Book('BK010', 'JavaScript cho Người Mới', 'Kyle Simpson', 'Tin học', 'https://m.media-amazon.com/images/I/41T5H8u7fUL._SX342_SY445_.jpg', 'Học JavaScript từ con số 0 với các ví dụ thực tế dễ hiểu.', JSON.stringify(bookPages.tinHoc)),
    new Book('BK011', 'Python Cơ Bản', 'Eric Matthes', 'Tin học', 'https://m.media-amazon.com/images/I/51Fct-zqAKL._SX377_BO1,204,203,200_.jpg', 'Cuốn sách lý tưởng để bắt đầu học lập trình Python.', JSON.stringify(bookPages.tinHoc)),

    // Kỹ năng
    new Book('BK002', 'Tuổi Trẻ Đáng Giá Bao Nhiêu', 'Rosie Nguyễn', 'Kỹ năng', 'https://bizweb.dktcdn.net/100/197/269/products/tuoi-tre-dang-gia-bao-nhieu.jpg?v=1522312675973', 'Cuốn sách truyền cảm hứng cho giới trẻ Việt Nam.', JSON.stringify(bookPages.kyNang)),
    new Book('BK006', 'Đắc Nhân Tâm', 'Dale Carnegie', 'Kỹ năng', 'https://cdn0.fahasa.com/media/catalog/product/d/a/dac-nhan-tam.jpg', 'Nghệ thuật thu phục lòng người và xây dựng mối quan hệ.', JSON.stringify(bookPages.kyNang)),
    new Book('BK007', 'Thói Quen Thành Công', 'Stephen Covey', 'Kỹ năng', 'https://cdn0.fahasa.com/media/catalog/product/7/t/7thoi-quen.jpg', '7 thói quen của người thành đạt, kinh điển về phát triển bản thân.', JSON.stringify(bookPages.kyNang)),
    new Book('BK012', 'Nghĩ Giàu Làm Giàu', 'Napoleon Hill', 'Kỹ năng', 'https://cdn0.fahasa.com/media/catalog/product/n/g/nghi-giau-lam-giau.jpg', 'Bí mật tư duy của những người thành công nhất thế giới.', JSON.stringify(bookPages.kyNang)),

    // Văn học
    new Book('BK003', 'Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 'Văn học', 'https://salt.tikicdn.com/cache/w1200/ts/product/2e/b5/35/2eb5357929d9553b3b4f99589a1c6a2b.jpg', 'Tác phẩm văn học thiếu nhi kinh điển của Việt Nam.', JSON.stringify(bookPages.literatura)),
    new Book('BK004', 'Nhà Giả Kim', 'Paulo Coelho', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/n/h/nha-gia-kim-tai-ban-2020.jpg', 'Hành trình đi tìm kho báu của chàng chăn cừu Santiago.', JSON.stringify(bookPages.literatura)),
    new Book('BK008', 'Số Đỏ', 'Vũ Trọng Phụng', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/s/o/so-do.jpg', 'Tiểu thuyết trào phúng xuất sắc của nền văn học Việt Nam.', JSON.stringify(bookPages.literatura)),
    new Book('BK013', 'Tắt Đèn', 'Ngô Tất Tố', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/t/a/tat-den.jpg', 'Tác phẩm hiện thực phê phán về cuộc sống nông thôn Việt Nam.', JSON.stringify(bookPages.literatura)),
    new Book('BK014', 'Chí Phèo', 'Nam Cao', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/c/h/chi-pheo.jpg', 'Kiệt tác về bi kịch bị cự tuyệt quyền làm người.', JSON.stringify(bookPages.literatura)),

    // Khoa học
    new Book('BK009', 'Lược Sử Thời Gian', 'Stephen Hawking', 'Khoa học', 'https://cdn0.fahasa.com/media/catalog/product/l/u/luoc-su-thoi-gian.jpg', 'Khám phá vũ trụ từ Big Bang đến lỗ đen qua góc nhìn thiên tài vật lý.', JSON.stringify(bookPages.khoaHoc)),
    new Book('BK015', 'Sapiens: Lược Sử Loài Người', 'Yuval Harari', 'Khoa học', 'https://cdn0.fahasa.com/media/catalog/product/s/a/sapiens.jpg', 'Hành trình 70,000 năm của loài Homo Sapiens từ thời tiền sử đến hiện đại.', JSON.stringify(bookPages.khoaHoc)),
    new Book('BK016', 'Vũ Trụ Trong Vỏ Hạt Dẻ', 'Stephen Hawking', 'Khoa học', 'https://cdn0.fahasa.com/media/catalog/product/v/u/vu-tru-trong-vo-hat-de.jpg', 'Tiếp nối Lược Sử Thời Gian với những lý thuyết vật lý hiện đại.', JSON.stringify(bookPages.khoaHoc)),

    // Sách PDF mới
    new Book('PDF001', 'Hà Nội Băm Sáu Phố Phường', 'Thạch Lam', 'Văn học', 'covers/hanoi_cover.png', 'Tập bút ký nổi tiếng về vẻ đẹp và văn hóa Hà Nội.', null, 'Hà-Nội-băm-sáu-phố-phường-Thạch-Lam.pdf'),
    new Book('PDF002', 'Mưa Đỏ', 'Chu Lai', 'Văn học', 'covers/mua_do_cover.png', 'Tiểu thuyết về chiến tranh ác liệt và hào hùng.', null, 'Mua-Do-Chu-Lai-1.pdf'),
    new Book('PDF003', 'Mãi Mãi Tuổi Hai Mươi', 'Nguyễn Văn Thạc', 'Văn học', 'covers/tuoi_hai_muoi_cover.png', 'Nhật ký thời chiến xúc động của liệt sĩ Nguyễn Văn Thạc.', null, 'Mãi-mãi-tuổi-hai-mươi-Nguyễn-Văn-Thạc.pdf'),
    new Book('PDF004', 'Toán 11 Tập 1', 'Bộ Giáo Dục', 'Tin học', 'covers/toan_11_cover.png', 'Sách giáo khoa Toán lớp 11 - Tập 1.', null, 'Toán 11 t1.pdf'),
    new Book('PDF005', 'Chí Phèo (PDF)', 'Nam Cao', 'Văn học', 'covers/chi_pheo_cover.png', 'Bản PDF tác phẩm Chí Phèo.', null, 'chi-pheo-nam-cao_23220239224.pdf')
];


class LibraryManager {
    constructor() {
        this.books = this.loadBooks();
        this.logs = this.loadLogs();
        this.users = this.loadUsers();

        // --- NEW: Seed/Update Manager Account ---
        const mgrIndex = this.users.findIndex(u => u.id.toLowerCase() === 'manager');
        if (mgrIndex >= 0) {
            // Force update to ensure access
            this.users[mgrIndex].password = '123';
            this.users[mgrIndex].role = 'admin';
            this.users[mgrIndex].name = 'Quản Lý Thư Viện';
        } else {
            this.users.push({
                id: 'manager',
                name: 'Quản Lý Thư Viện',
                class: 'Giáo Viên',
                password: '123',
                role: 'admin'
            });
        }
        this.saveUsers();
    }

    // --- DATA LOADING ---
    loadBooks() {
        let books = [];
        // Version check - force refresh if data version changed
        const storedVersion = localStorage.getItem(STORAGE_KEY_VERSION);
        if (storedVersion !== DATA_VERSION.toString()) {
            console.log('[Library] Data version changed, refreshing book data...');
            localStorage.removeItem(STORAGE_KEY_BOOKS);
            localStorage.setItem(STORAGE_KEY_VERSION, DATA_VERSION.toString());
        }

        const stored = localStorage.getItem(STORAGE_KEY_BOOKS);
        if (stored) {
            books = JSON.parse(stored);
            // Sync logic: Ensure all books in initialBooks exist in storage
            let changed = false;
            initialBooks.forEach(initBook => {
                if (!books.find(b => b.id === initBook.id)) {
                    books.push(initBook);
                    changed = true;
                }
            });
            // Update existing books with new fields locally if needed (optional)
            books.forEach(b => {
                const init = initialBooks.find(ib => ib.id === b.id);
                if (init && init.pdf && !b.pdf) {
                    b.pdf = init.pdf;
                    changed = true;
                }
            });

            if (changed) {
                localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
            }
        } else {
            books = initialBooks;
            localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
        }
        return books;
    }
    loadLogs() {
        const stored = localStorage.getItem(STORAGE_KEY_LOGS);
        return stored ? JSON.parse(stored) : [];
    }
    loadUsers() {
        const stored = localStorage.getItem(STORAGE_KEY_USERS);
        return stored ? JSON.parse(stored) : [];
    }

    // --- SAVING ---
    save() { localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(this.books)); }
    saveLogs() {
        if (this.logs.length > 20) this.logs = this.logs.slice(0, 20);
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(this.logs));
    }
    saveUsers() { localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users)); }

    // --- AUTHENTICATION ---
    authRegister(userData) {
        // userData: { id, name, class, password, role }
        if (this.users.find(u => u.id.toLowerCase() === userData.id.toLowerCase())) {
            return { success: false, message: 'Mã học sinh đã tồn tại!' };
        }
        // Default role is 'student' unless specified
        userData.role = userData.role || 'student';
        this.users.push(userData);
        this.saveUsers();
        return { success: true, message: 'Đăng ký thành công! Vui lòng đăng nhập.' };
    }

    authLogin(id, password) {
        const normId = id.toLowerCase();

        // Hardcoded Admin Bypass
        if (normId === 'admin' && password === 'admin123') {
            const adminSession = { id: 'ADMIN', name: 'Quản Trị Viên', class: 'Staff', role: 'admin', loginTime: Date.now() };
            localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(adminSession));
            return { success: true, message: 'Đăng nhập Quản trị viên thành công!' };
        }

        const user = this.users.find(u => u.id.toLowerCase() === normId && u.password === password);
        if (user) {
            // Set session
            const session = { id: user.id, name: user.name, class: user.class, role: user.role || 'student', loginTime: Date.now() };
            localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
            return { success: true, message: 'Đăng nhập thành công!' };
        }
        return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu.' };
    }

    authLogout() {
        localStorage.removeItem(STORAGE_KEY_SESSION);
        window.location.href = 'index.html'; // Redirect to home
    }

    getCurrentUser() {
        const stored = localStorage.getItem(STORAGE_KEY_SESSION);
        return stored ? JSON.parse(stored) : null;
    }

    // --- SECURITY CHECKS ---
    checkAdminAccess() {
        const user = this.getCurrentUser();
        // Allow if role is admin OR id is specifically 'manager' (double safety)
        if (!user || (user.role !== 'admin' && user.id.toLowerCase() !== 'manager')) {
            alert('Truy cập bị từ chối! Bạn cần quyền Quản trị viên.');
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // --- LOGS ---
    logActivity(message) {
        this.logs.unshift({ message, timestamp: new Date().toLocaleString('vi-VN') });
        this.saveLogs();
        renderActivityLog(this.logs);
    }

    // --- BOOK ACTIONS ---
    addBook(name, author) {
        const id = 'BK' + Date.now().toString().slice(-4) + Math.floor(Math.random() * 10);
        const newBook = new Book(id, name, author, 'Tổng hợp', null, 'Sách mới thêm.', dummyContent);
        this.books.push(newBook);
        this.save();
        this.logActivity(`Thêm sách mới: ${name} (${id})`);
        return newBook;
    }

    findBook(id) { return this.books.find(b => b.id.toUpperCase() === id.toUpperCase()); }

    borrowBook(id, borrowerName) {
        const book = this.findBook(id);
        if (!book) return { success: false, message: 'Mã sách không tồn tại!' };
        if (book.status !== 'Còn') return { success: false, message: `Sách đang được mượn bởi: ${book.borrower}` };

        book.status = 'Đang mượn';
        book.borrower = borrowerName;
        book.borrowDate = new Date().toLocaleDateString('vi-VN');
        this.save();
        this.logActivity(`${borrowerName} mượn sách ${book.name} (${id})`);
        return { success: true, message: `Cho mượn sách "${book.name}" thành công!` };
    }

    returnBook(id) {
        const book = this.findBook(id);
        if (!book) return { success: false, message: 'Mã sách không tồn tại!' };
        if (book.status === 'Còn') return { success: false, message: 'Sách này chưa được mượn!' };

        const prev = book.borrower;
        book.status = 'Còn'; book.borrower = null; book.borrowDate = null;
        this.save();
        this.logActivity(`${prev} trả sách ${book.name} (${id})`);
        return { success: true, message: `Đã trả sách "${book.name}".` };
    }

    getStats() {
        const total = this.books.length;
        const borrowed = this.books.filter(b => b.status === 'Đang mượn').length;
        return { total, borrowed, available: total - borrowed };
    }

    // --- ADMIN DASHBOARD ---
    renderAdminDashboard() {
        // 1. Render Stats
        updateStatsUI(this);

        // 2. Render Borrowed Books Table
        const tbody = document.getElementById('adminLogsBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const borrowedBooks = this.books.filter(b => b.status === 'Đang mượn');

        if (borrowedBooks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#666;">Hiện tại không có sách nào đang được mượn.</td></tr>';
            return;
        }

        borrowedBooks.forEach(book => {
            const tr = document.createElement('tr');
            // Assuming book.borrower is just a name string based on current logic. 
            // If we want class, we might need to look it up from users or store it in book.
            // For now, let's try to find the user details if possible, or just show the name.

            // Try to find user class from cached users if name matches (not perfect unique key, but works for simple app)
            const user = this.users.find(u => u.name === book.borrower);
            const userClass = user ? user.class : 'N/A';

            tr.innerHTML = `
                <td><strong>${book.borrower}</strong></td>
                <td>${userClass}</td>
                <td>${book.name} <br> <small style="color:#888">${book.id}</small></td>
                <td>${book.borrowDate}</td>
                <td><span class="status-badge status-borrowed">Đang mượn</span></td>
                <td>
                    <button class="btn-return" onclick="handleReturn('${book.id}')">
                        <i class="fas fa-undo"></i> Trả Sách
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Global handler for the return button in Admin Dashboard
window.handleReturn = function (bookId) {
    if (confirm('Xác nhận đã nhận lại sách này?')) {
        const app = new LibraryManager();
        const result = app.returnBook(bookId);
        if (result.success) {
            showToast(result.message, 'success');
            app.renderAdminDashboard(); // Re-render
        } else {
            showToast(result.message, 'error');
        }
    }
}

// --------------------------------------------------------------------------
// 2. UI Helper Functions
// --------------------------------------------------------------------------

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'fadeOut 0.3s ease-out forwards'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function renderActivityLog(logs) {
    const list = document.getElementById('activityLog');
    if (!list) return;
    list.innerHTML = '';
    if (logs.length === 0) { list.innerHTML = '<li style="color:#999; font-style:italic;">Chưa có hoạt động nào.</li>'; return; }
    logs.slice(0, 5).forEach(log => {
        const li = document.createElement('li');
        li.innerHTML = `${log.message}<span class="activity-time">${log.timestamp}</span>`;
        list.appendChild(li);
    });
}

function updateStatsUI(app) {
    const totalEl = document.getElementById('statTotal');
    const borrowEl = document.getElementById('statBorrowed');
    const availEl = document.getElementById('statAvailable');
    if (totalEl && borrowEl && availEl) {
        const stats = app.getStats();
        totalEl.textContent = stats.total; borrowEl.textContent = stats.borrowed; availEl.textContent = stats.available;
    }
}

// --- AUTH HEADER UPDATE ---
function updateUserHeader() {
    const app = new LibraryManager();
    const user = app.getCurrentUser();
    const userActionDiv = document.querySelector('.user-actions');

    if (userActionDiv) {
        if (user) {
            let adminLink = '';
            if (user.role === 'admin') {
                adminLink = `<a href="admin.html" class="btn-primary" style="padding: 5px 10px; margin-right: 10px; font-size: 0.8rem; background-color: #e74c3c;">Admin</a>`;
            }

            userActionDiv.innerHTML = `
                ${adminLink}
                <span class="welcome-text">Xin chào, <strong style="color:var(--primary-color)">${user.name}</strong></span>
                <button onclick="logout()" class="btn-primary" style="padding: 5px 10px; margin-left: 10px; font-size: 0.8rem;">Đăng Xuất</button>
            `;
        } else {
            userActionDiv.innerHTML = `
                <a href="login.html" class="btn-primary" style="padding: 5px 15px; margin-right: 5px; text-decoration: none; color: white;">Đăng Nhập</a>
                <a href="register.html" style="color: var(--primary-color); font-weight: 500; text-decoration: none;">Đăng Ký</a>
            `;
        }
    }
}

window.logout = function () {
    const app = new LibraryManager();
    app.authLogout();
}

// --------------------------------------------------------------------------
// 3. UI Controller
// --------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function () {
    // 1. Update Header Info
    updateUserHeader();

    const app = new LibraryManager();
    window.appInstance = app; // Expose for debugging

    // Log Activity (Global)
    renderActivityLog(app.logs);

    // 2. Table Page Logic
    const tableBody = document.getElementById('bookListBody');
    if (tableBody) {
        function refreshUI(filterText = '') {
            renderTable(filterText);
            updateStatsUI(app);
            renderActivityLog(app.logs);
        }

        function renderTable(filterText = '') {
            tableBody.innerHTML = '';
            app.books.forEach(book => {
                const contentString = `${book.id} ${book.name} ${book.author} ${book.category}`.toLowerCase();
                if (filterText && !contentString.includes(filterText.toLowerCase())) return;

                const tr = document.createElement('tr');
                const statusClass = book.status === 'Còn' ? 'available' : 'borrowed';
                const statusText = book.status === 'Còn' ? 'Còn' : `Đang mượn`;

                tr.innerHTML = `
                    <td><strong>${book.id}</strong></td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${book.image}" class="book-cover" alt="Cover" onerror="this.src='https://via.placeholder.com/40x60'">
                            <span>${book.name}</span>
                        </div>
                    </td>
                    <td>${book.author}</td>
                    <td>${book.category}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td>
                        <a href="detail.html?id=${book.id}" class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem; text-decoration: none; display: inline-block;">
                            <i class="fas fa-eye"></i> Xem
                        </a>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }
        refreshUI();

        // --- SEARCH ---
        const searchInput = document.getElementById('tableSearch');
        if (searchInput) searchInput.addEventListener('keyup', function () { refreshUI(this.value); });
    }

    // --- BORROW FORM LOGIC ONLY (Manual) ---
    // Note: The new detail.html borrow form calls app methods directly, 
    // but the old index.html borrow form (if existed) would need updates.
    // Assuming we use detail.html primarily now.

    // Auto-fill Modal on detail.html
    const borrowModal = document.getElementById('borrowModal');
    if (borrowModal) {
        // Observe when modal opens to auto-fill
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('open')) {
                    const user = app.getCurrentUser();
                    if (user) {
                        const nameInput = document.getElementById('borrowName');
                        const classInput = document.getElementById('borrowClass');
                        if (nameInput) nameInput.value = user.name;
                        if (classInput) classInput.value = user.class;
                        // Optional: Make readonly
                        // nameInput.setAttribute('readonly', true);
                    }
                }
            });
        });
        observer.observe(borrowModal, { attributes: true, attributeFilter: ['class'] });
    }
});
