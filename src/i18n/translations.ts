export type Language = "vi" | "en";

export const DEFAULT_LANGUAGE: Language = "vi";

// Flat key -> { vi, en } dictionary. Keys are grouped by screen/feature via
// dot-prefixes purely for readability; there is no nesting at runtime.
const dict = {
  // Bottom navigation
  "nav.garden": { vi: "Khu vườn", en: "Garden" },
  "nav.collection": { vi: "Bộ sưu tập", en: "Collection" },
  "nav.favorites": { vi: "Yêu thích", en: "Favorites" },
  "nav.profile": { vi: "Cá nhân", en: "Profile" },
  "nav.addBouquet": { vi: "Thêm bó hoa", en: "Add a bouquet" },

  // Onboarding
  "onboarding.skip": { vi: "Bỏ qua", en: "Skip" },
  "onboarding.next": { vi: "Tiếp theo", en: "Next" },
  "onboarding.start": { vi: "Bắt đầu khu vườn", en: "Start my garden" },
  "onboarding.slide1.title": { vi: "Lưu giữ mọi bó hoa", en: "Save every bouquet" },
  "onboarding.slide1.body": {
    vi: "Tải lên hoặc chụp lại những bó hoa bạn không muốn quên.",
    en: "Upload or photograph the bouquets you don't want to forget.",
  },
  "onboarding.slide2.title": { vi: "Khám phá ý nghĩa", en: "Discover their meanings" },
  "onboarding.slide2.body": {
    vi: "AI giúp nhận diện từng loài hoa và giải thích ý nghĩa của chúng.",
    en: "AI helps identify each flower and explains what it symbolizes.",
  },
  "onboarding.slide3.title": { vi: "Nuôi lớn khu vườn riêng", en: "Grow your own garden" },
  "onboarding.slide3.body": {
    vi: "Đặt từng bó hoa vào khu vườn cá nhân luôn lớn dần theo thời gian.",
    en: "Place every bouquet into a personal garden that keeps growing with you.",
  },

  // Garden page
  "garden.greeting.morning": { vi: "Chào buổi sáng", en: "Good morning" },
  "garden.greeting.afternoon": { vi: "Chào buổi chiều", en: "Good afternoon" },
  "garden.greeting.evening": { vi: "Chào buổi tối", en: "Good evening" },
  "garden.counter.bouquet": { vi: "bó hoa", en: "bouquet" },
  "garden.counter.bouquets": { vi: "bó hoa", en: "bouquets" },
  "garden.counter.species": { vi: "loài hoa", en: "species found" },
  "garden.empty.title": { vi: "Khu vườn đang chờ", en: "Your garden is" },
  "garden.empty.titleEm": { vi: "nở hoa", en: "waiting to bloom" },
  "garden.empty.body": {
    vi: "Thêm bó hoa đầu tiên và biến khoảnh khắc đẹp thành kỷ niệm sẽ lớn dần theo thời gian.",
    en: "Add your first bouquet and turn a beautiful moment into a memory that keeps growing.",
  },
  "garden.empty.cta": { vi: "Thêm bó hoa đầu tiên", en: "Add my first bouquet" },

  // Collection
  "collection.title": { vi: "Bộ sưu tập", en: "Collection" },
  "collection.titleEm": { vi: "của bạn", en: "" },
  "collection.searchPlaceholder": { vi: "Tìm bó hoa hoặc loài hoa", en: "Search bouquets or flowers" },
  "collection.filterAll": { vi: "Tất cả", en: "All" },
  "collection.occasion": { vi: "Dịp", en: "Occasion" },
  "collection.sortBy": { vi: "Sắp xếp theo", en: "Sort by" },
  "collection.sortNewest": { vi: "Mới nhất", en: "Newest" },
  "collection.sortOldest": { vi: "Cũ nhất", en: "Oldest" },
  "collection.emptyAll": { vi: "Chưa có gì ở đây. Thêm bó hoa đầu tiên để bắt đầu bộ sưu tập.", en: "Nothing here yet. Add your first bouquet to start your collection." },
  "collection.emptyFiltered": { vi: "Không có bó hoa nào khớp với tìm kiếm hoặc bộ lọc.", en: "No bouquets match your search or filters." },
  "collection.inGarden": { vi: "Trong vườn", en: "In garden" },
  "collection.notPlaced": { vi: "Chưa đặt", en: "Not placed" },
  "collection.noSpeciesYet": { vi: "Chưa có loài hoa", en: "No species yet" },

  // Favorites
  "favorites.title": { vi: "Yêu thích", en: "Favorites" },
  "favorites.titleEm": { vi: "của bạn", en: "" },
  "favorites.empty": { vi: "Chạm vào trái tim ở bất kỳ bó hoa nào để lưu vào đây.", en: "Tap the heart on any bouquet to keep it close here." },

  // Profile / Settings
  "profile.savedCount": { vi: "bó hoa đã lưu", en: "bouquets saved" },
  "profile.yourName": { vi: "Tên của bạn", en: "Your name" },
  "profile.gardenName": { vi: "Tên khu vườn", en: "Garden name" },
  "profile.save": { vi: "Lưu thay đổi", en: "Save changes" },
  "profile.saved": { vi: "Đã cập nhật hồ sơ", en: "Profile updated" },
  "profile.language": { vi: "Ngôn ngữ", en: "Language" },
  "profile.languageVi": { vi: "Tiếng Việt", en: "Vietnamese" },
  "profile.languageEn": { vi: "Tiếng Anh", en: "English" },
  "profile.signOut": { vi: "Đăng xuất", en: "Sign out" },
  "profile.signOutConfirmTitle": { vi: "Đăng xuất?", en: "Sign out?" },
  "profile.signOutConfirmBody": {
    vi: "Khu vườn của bạn đã được lưu an toàn — bạn có thể đăng nhập lại bất cứ lúc nào để tiếp tục.",
    en: "Your garden is safely saved — you can sign back in anytime to pick up where you left off.",
  },
  "profile.resetData": { vi: "Đặt lại dữ liệu", en: "Reset data" },
  "profile.resetting": { vi: "Đang đặt lại…", en: "Resetting…" },
  "profile.resetConfirmTitle": { vi: "Đặt lại toàn bộ dữ liệu?", en: "Reset all data?" },
  "profile.resetConfirmBody": {
    vi: "Toàn bộ bó hoa, khu vườn và ảnh đã lưu sẽ bị xoá vĩnh viễn và bạn sẽ bắt đầu lại từ đầu. Không thể hoàn tác.",
    en: "Every bouquet, garden, and saved photo will be permanently deleted and you'll start over from scratch. This can't be undone.",
  },
  "profile.resetError": {
    vi: "Không thể đặt lại dữ liệu. Vui lòng thử lại.",
    en: "Couldn't reset your data. Please try again.",
  },

  // Public garden sharing
  "share.settingsTitle": { vi: "Chia sẻ khu vườn", en: "Share your garden" },
  "share.settingsBody": {
    vi: "Bất kỳ ai có link đều có thể xem khu vườn, bộ sưu tập và thông tin về hoa. Tên cá nhân, email, người tặng và ghi chú riêng tư sẽ không được chia sẻ.",
    en: "Anyone with the link can view the garden, collection, and flower information. Your name, email, giver, and personal notes stay private.",
  },
  "share.createLink": { vi: "Tạo link chia sẻ", en: "Create share link" },
  "share.publicLink": { vi: "Link khu vườn công khai", en: "Public garden link" },
  "share.copyLink": { vi: "Sao chép", en: "Copy" },
  "share.shareNow": { vi: "Chia sẻ", en: "Share" },
  "share.disableLink": { vi: "Tắt và thu hồi link", en: "Disable and revoke link" },
  "share.linkCreated": { vi: "Đã tạo link chia sẻ", en: "Share link created" },
  "share.linkCopied": { vi: "Đã sao chép link", en: "Link copied" },
  "share.linkDisabled": { vi: "Đã thu hồi link chia sẻ", en: "Share link revoked" },
  "share.error": { vi: "Không thể cập nhật link. Vui lòng thử lại.", en: "Couldn't update the link. Please try again." },
  "share.readOnly": { vi: "Chế độ chỉ xem", en: "View only" },
  "share.growingIn": { vi: "Đang được đặt tại", en: "Growing in" },
  "share.emptyGarden": { vi: "Khu vườn này chưa có khu vực nào.", en: "This garden has no areas yet." },
  "share.emptyCollection": { vi: "Bộ sưu tập này chưa có bó hoa nào.", en: "This collection has no bouquets yet." },
  "share.notFoundTitle": { vi: "Không tìm thấy khu vườn", en: "Garden not found" },
  "share.notFoundBody": {
    vi: "Link có thể không đúng hoặc chủ khu vườn đã ngừng chia sẻ.",
    en: "The link may be incorrect or the garden owner has stopped sharing.",
  },

  // Auth (login/sign up)
  "auth.title": { vi: "Chào mừng trở lại", en: "Welcome back" },
  "auth.subtitle": {
    vi: "Đăng nhập để đồng bộ khu vườn của bạn trên mọi thiết bị.",
    en: "Sign in to sync your garden across every device.",
  },
  "auth.emailLabel": { vi: "Email", en: "Email" },
  "auth.passwordLabel": { vi: "Mật khẩu", en: "Password" },
  "auth.signInTab": { vi: "Đăng nhập", en: "Sign in" },
  "auth.signUpTab": { vi: "Đăng ký", en: "Sign up" },
  "auth.signInCta": { vi: "Đăng nhập", en: "Sign in" },
  "auth.signUpCta": { vi: "Tạo tài khoản", en: "Create account" },
  "auth.loading": { vi: "Đang xử lý…", en: "Working…" },
  "auth.checkEmail": {
    vi: "Kiểm tra email và bấm vào liên kết xác nhận. App sẽ tự động đăng nhập sau khi xác nhận thành công.",
    en: "Check your email and tap the confirmation link. The app will sign you in automatically after confirmation.",
  },
  "auth.emailNotConfirmed": {
    vi: "Email chưa được xác nhận. Hãy mở liên kết trong email hoặc gửi lại email xác nhận.",
    en: "Email has not been confirmed. Open the link in your email or resend the confirmation email.",
  },
  "auth.resendConfirmation": { vi: "Gửi lại email xác nhận", en: "Resend confirmation email" },
  "auth.resendSent": { vi: "Đã gửi lại email xác nhận", en: "Confirmation email sent" },
  "auth.passwordHint": { vi: "Ít nhất 6 ký tự", en: "At least 6 characters" },

  // Shared actions
  "common.cancel": { vi: "Hủy", en: "Cancel" },
  "common.confirm": { vi: "Xác nhận", en: "Confirm" },
  "common.remove": { vi: "Xóa", en: "Remove" },
  "common.removing": { vi: "Đang xóa…", en: "Removing…" },
  "common.close": { vi: "Đóng", en: "Close" },
  "common.back": { vi: "Quay lại", en: "Go back" },
  "common.continue": { vi: "Tiếp tục", en: "Continue" },
  "common.tryAgain": { vi: "Thử lại", en: "Try again" },
  "common.edit": { vi: "Chỉnh sửa", en: "Edit" },
  "common.done": { vi: "Xong", en: "Done" },
  "common.retry": { vi: "Thử lại", en: "Try again" },
  "common.favorite": { vi: "Yêu thích", en: "Favorite" },
  "common.save": { vi: "Lưu", en: "Save" },
  "common.saving": { vi: "Đang lưu…", en: "Saving…" },

  // Bouquet card / quick view
  "bouquet.openJournal": { vi: "Mở nhật ký bó hoa", en: "Open bouquet journal" },
  "bouquet.addToFavorites": { vi: "Thêm vào yêu thích", en: "Add to favorites" },
  "bouquet.removeFromFavorites": { vi: "Bỏ khỏi yêu thích", en: "Remove from favorites" },
  "bouquet.noFlowersRecorded": { vi: "Chưa có loài hoa nào", en: "No flowers recorded" },

  // Bouquet detail
  "detail.notFoundTitle": { vi: "Không tìm thấy bó hoa này", en: "This bouquet couldn't be found" },
  "detail.notFoundBody": { vi: "Có thể nó đã bị xóa khỏi khu vườn của bạn.", en: "It may have already been removed from your garden." },
  "detail.backToCollection": { vi: "Về Bộ sưu tập", en: "Back to Collection" },
  "detail.growingIn": { vi: "Đang trồng tại", en: "Growing in" },
  "detail.notPlacedYet": { vi: "Chưa được đặt vào vườn", en: "Not placed in the garden yet" },
  "detail.from": { vi: "Từ", en: "From" },
  "detail.personalNote": { vi: "Ghi chú cá nhân", en: "Personal note" },
  "detail.theFlowers": { vi: "Các loài hoa", en: "The flowers" },
  "detail.saveChanges": { vi: "Lưu thay đổi", en: "Save changes" },
  "detail.editBouquet": { vi: "Sắp xếp", en: "Arrange" },
  "detail.changePhoto": { vi: "Đổi ảnh bó hoa", en: "Change bouquet photo" },
  "detail.moveInGarden": { vi: "Di chuyển trong vườn", en: "Move in garden" },
  "detail.placeInGarden": { vi: "Đặt vào vườn", en: "Place in garden" },
  "detail.removeFromGarden": { vi: "Gỡ khỏi vườn (vẫn giữ trong Bộ sưu tập)", en: "Remove from garden (keep in Collection)" },
  "detail.deleteBouquet": { vi: "Xóa bó hoa", en: "Delete bouquet" },
  "detail.deleteConfirmTitle": { vi: "Xóa bó hoa này?", en: "Remove this bouquet?" },
  "detail.deleteConfirmBody": {
    vi: "Thao tác này xóa bó hoa khỏi cả Bộ sưu tập và Khu vườn. Không thể hoàn tác.",
    en: "This removes it from both your Collection and your Garden. This can't be undone.",
  },
  "detail.deletedToast": { vi: "Đã xóa bó hoa khỏi khu vườn", en: "Bouquet removed from your garden" },
  "detail.movedToast": { vi: "Đã chuyển bó hoa", en: "Bouquet moved" },
  "detail.removedFromGardenToast": { vi: "Đã chuyển về Bộ sưu tập", en: "Moved to Collection" },
  "detail.updatedToast": { vi: "Đã cập nhật bó hoa", en: "Bouquet updated" },
  "detail.editValidation": { vi: "Bó hoa cần có tên và ít nhất một loài hoa.", en: "A bouquet needs a name and at least one flower." },
  "detail.chooseFrame": { vi: "Chọn khung ảnh", en: "Choose a frame" },
  "detail.editInfo": { vi: "Sửa thông tin", en: "Edit info" },
  "detail.editMemoryTitle": { vi: "Chỉnh sửa kỷ niệm", en: "Edit the memory" },
  "detail.cancelEditTitle": { vi: "Hủy chỉnh sửa?", en: "Discard changes?" },
  "detail.cancelEditBody": { vi: "Những thay đổi chưa lưu sẽ bị mất.", en: "Your unsaved changes will be lost." },
  "detail.cancelEditConfirm": { vi: "Hủy thay đổi", en: "Discard changes" },
  "detail.cancelEditContinue": { vi: "Tiếp tục chỉnh sửa", en: "Keep editing" },

  // Garden edit mode (drag-and-drop repositioning)
  "gardenEdit.title": { vi: "Sắp xếp khu vườn", en: "Arrange your garden" },
  "gardenEdit.cancel": { vi: "Hủy", en: "Cancel" },
  "gardenEdit.saving": { vi: "Đang lưu...", en: "Saving..." },
  "gardenEdit.done": { vi: "Xong", en: "Done" },
  "gardenEdit.discardTitle": { vi: "Bỏ thay đổi vị trí?", en: "Discard position changes?" },
  "gardenEdit.discardBody": {
    vi: "Bó hoa sẽ trở về vị trí trước đó.",
    en: "The bouquet will return to its previous spot.",
  },
  "gardenEdit.discardConfirm": { vi: "Bỏ thay đổi", en: "Discard changes" },
  "gardenEdit.slotOccupied": {
    vi: "Vị trí này đã có bó hoa khác. Vui lòng chọn vị trí trống.",
    en: "This spot already has another bouquet. Please choose an empty one.",
  },
  "gardenEdit.saveFailed": {
    vi: "Không thể lưu vị trí mới. Vui lòng thử lại.",
    en: "We couldn't save the new position. Please try again.",
  },
  "gardenEdit.dragHint": { vi: "Giữ và kéo bó hoa để đổi vị trí", en: "Hold and drag the bouquet to move it" },
  "gardenEdit.trayHint": { vi: "Kéo bó hoa vào một vị trí trống", en: "Drag the bouquet into an empty spot" },
  "gardenEdit.saved": { vi: "Đã cập nhật vị trí trong vườn", en: "Garden position updated" },

  // Flower card
  "flower.unnamed": { vi: "Chưa đặt tên", en: "Unnamed flower" },
  "flower.noDetails": { vi: "Chưa có chi tiết", en: "No details yet" },
  "flower.stems": { vi: "cành", en: "stems" },
  "flower.lowConfidence": {
    vi: "Chúng tôi chưa chắc chắn hoàn toàn về loài hoa này. Vui lòng kiểm tra lại trước khi lưu.",
    en: "We're not completely sure about this flower. Please check before saving.",
  },
  "flower.edit": { vi: "Sửa", en: "Edit" },
  "flower.remove": { vi: "Xóa", en: "Remove" },
  "flower.name": { vi: "Tên loài hoa", en: "Flower name" },
  "flower.namePlaceholder": { vi: "VD: Hoa hồng vườn", en: "e.g. Garden Rose" },
  "flower.color": { vi: "Màu sắc", en: "Color" },
  "flower.colorPlaceholder": { vi: "VD: Hồng", en: "e.g. Pink" },
  "flower.quantity": { vi: "Số lượng", en: "Quantity" },
  "flower.quantityPlaceholder": { vi: "VD: 6", en: "e.g. 6" },
  "flower.meaning": { vi: "Ý nghĩa", en: "Meaning" },
  "flower.meaningPlaceholder": { vi: "Loài hoa này tượng trưng cho điều gì?", en: "What does this flower symbolize?" },
  "flower.doneEditing": { vi: "Xong, đóng chỉnh sửa", en: "Done editing" },

  // Add bouquet flow — step titles
  "add.step.source": { vi: "Thêm bó hoa", en: "Add a bouquet" },
  "add.step.preview": { vi: "Xem trước ảnh", en: "Preview your photo" },
  "add.step.analyzing": { vi: "Đang nhận diện hoa", en: "Identifying flowers" },
  "add.step.review": { vi: "Xem lại các loài hoa", en: "Review the flowers" },
  "add.step.memory": { vi: "Lưu kỷ niệm", en: "Save the memory" },
  "add.step.memoryEdit": { vi: "Chỉnh sửa kỷ niệm", en: "Edit the memory" },
  "add.step.placement": { vi: "Chọn nơi hoa sẽ nở", en: "Choose where it blooms" },
  "add.step.success": { vi: "Đã lưu bó hoa", en: "Bouquet saved" },

  "add.source.intro": {
    vi: "Thêm ảnh bó hoa bạn muốn lưu giữ. Bạn có thể chụp ảnh mới hoặc chọn ảnh đã có sẵn.",
    en: "Add a photo of the bouquet you'd like to remember. You can take a new photo or choose one you already have.",
  },
  "add.source.takePhoto": { vi: "Chụp ảnh", en: "Take a photo" },
  "add.source.checkingCamera": { vi: "Đang kiểm tra camera…", en: "Checking camera…" },
  "add.source.chooseLibrary": { vi: "Chọn từ thư viện", en: "Choose from library" },
  "add.source.preparingPhoto": { vi: "Đang xử lý ảnh…", en: "Preparing your photo…" },
  "add.source.cameraDenied": {
    vi: "Không thể truy cập camera. Bạn vẫn có thể tải ảnh từ thư viện.",
    en: "We couldn't access your camera. You can still upload a photo from your library.",
  },
  "add.preview.changePhoto": { vi: "Chọn ảnh khác", en: "Choose a different photo" },
  "add.preview.identify": { vi: "Nhận diện hoa", en: "Identify flowers" },
  "add.analyzing.message": { vi: "Đang khám phá các loài hoa trong bó hoa của bạn…", en: "Discovering the flowers in your bouquet…" },
  "add.analyzing.subtext": { vi: "Thường mất vài giây.", en: "This usually takes a few seconds." },
  "add.analyzing.failedTitle": { vi: "Không thể nhận diện hoa", en: "We couldn't identify the flowers" },
  "add.analyzing.addManually": { vi: "Thêm hoa thủ công", en: "Add flowers manually" },
  "add.review.introFound": {
    vi: "Đây là những gì chúng tôi tìm thấy. Sửa, xóa hoặc thêm hoa để chính xác hơn.",
    en: "Here's what we found. Edit, remove or add flowers so it's exactly right.",
  },
  "add.review.introEmpty": {
    vi: "Chưa có loài hoa nào — hãy thêm từng loài bạn muốn lưu giữ từ bó hoa này.",
    en: "No flowers yet — add each one you'd like to remember from this bouquet.",
  },
  "add.review.addFlower": { vi: "Thêm một loài hoa", en: "Add a flower" },
  "add.review.nameAllFlowers": { vi: "Hãy đặt tên cho mọi loài hoa trước khi tiếp tục.", en: "Give every flower a name before continuing." },
  "add.memory.name": { vi: "Tên bó hoa", en: "Bouquet name" },
  "add.memory.namePlaceholder": { vi: "VD: Bó hoa sinh nhật của mẹ", en: "e.g. Mom's Birthday Bouquet" },
  "add.memory.date": { vi: "Ngày nhận hoa", en: "Date received" },
  "add.memory.occasion": { vi: "Dịp", en: "Occasion" },
  "add.memory.selectPlaceholder": { vi: "Chọn…", en: "Select…" },
  "add.memory.customOccasion": { vi: "Mô tả dịp này", en: "Describe the occasion" },
  "add.memory.customOccasionPlaceholder": { vi: "VD: Buổi hẹn đầu tiên", en: "e.g. First date" },
  "add.memory.from": { vi: "Người tặng", en: "Gift giver" },
  "add.memory.fromPlaceholder": { vi: "Ai đã tặng bạn bó hoa này?", en: "Who gave you these flowers?" },
  "add.memory.note": { vi: "Ghi chú cá nhân", en: "Personal note" },
  "add.memory.notePlaceholder": { vi: "Điều gì khiến khoảnh khắc này đáng nhớ?", en: "What made this moment memorable?" },
  "add.memory.markFavorite": { vi: "Đánh dấu yêu thích", en: "Mark as favorite" },
  "add.memory.markedFavorite": { vi: "Đã đánh dấu yêu thích", en: "Marked as favorite" },
  "add.memory.chooseFrame": { vi: "Chọn khung ảnh cho bó hoa", en: "Choose a frame for your bouquet" },
  "add.memory.save": { vi: "Lưu", en: "Save" },
  "add.memory.saving": { vi: "Đang lưu…", en: "Saving…" },
  "add.memory.needFlower": { vi: "Thêm ít nhất một loài hoa để lưu lại.", en: "Add at least one flower to save it." },
  "add.memory.saveFailed": {
    vi: "Không thể lưu bó hoa này. Ảnh và thông tin của bạn vẫn còn — vui lòng thử lại.",
    en: "We couldn't save this bouquet. Your photo and details are still here — please try again.",
  },
  "add.placement.prompt": { vi: "Bạn muốn bó hoa này nở ở đâu?", en: "Where would you like this bouquet to bloom?" },
  "add.placement.chooseVase": { vi: "Chọn một chậu hoa", en: "Choose a vase" },
  "add.placement.addDecoration": { vi: "Thêm trang trí", en: "Add a decoration" },
  "add.placement.plantHere": { vi: "Trồng ở đây", en: "Plant it here" },
  "add.placement.planting": { vi: "Đang trồng…", en: "Planting…" },
  "add.placement.skip": { vi: "Bỏ qua, đặt sau", en: "Skip for now, place it later" },
  "add.placement.conflictQuestion": { vi: "đang mọc ở đây rồi. Bạn muốn làm gì?", en: "is already growing here. What would you like to do?" },
  "add.placement.swap": { vi: "Đổi chỗ", en: "Swap places" },
  "add.placement.moveToCollection": { vi: "Chuyển", en: "Move" },
  "add.placement.moveToCollectionSuffix": { vi: "về Bộ sưu tập", en: "to Collection" },
  "add.placement.chooseAnother": { vi: "Chọn vị trí khác", en: "Choose another spot" },
  "add.placement.takenError": { vi: "Vị trí đó vừa bị chiếm bởi", en: "That spot was just taken by" },
  "add.placement.chooseAnotherError": { vi: "Vui lòng chọn vị trí khác.", en: "Please choose another." },
  "add.success.body": {
    vi: "Kỷ niệm này giờ đang lớn lên trong khu vườn của bạn, sẵn sàng để ghé thăm bất cứ lúc nào.",
    en: "This memory is now growing in your garden, ready whenever you want to visit it again.",
  },
  "add.success.hasBloomed": { vi: "đã nở", en: "has bloomed" },
  "add.success.backToGarden": { vi: "Về Khu vườn", en: "Back to Garden" },
  "add.success.editNow": { vi: "Chỉnh sửa ngay", en: "Edit now" },
  "add.success.savedToast": { vi: "Đã lưu bó hoa vào khu vườn", en: "Bouquet saved to your garden" },
  "add.discard.title": { vi: "Hủy tạo bó hoa?", en: "Discard this bouquet?" },
  "add.discard.body": { vi: "Những thông tin bạn đã nhập sẽ không được lưu.", en: "The information you entered will not be saved." },
  "add.discard.confirm": { vi: "Hủy tạo", en: "Discard bouquet" },
  "add.discard.continue": { vi: "Tiếp tục chỉnh sửa", en: "Keep editing" },

  // Vase / decoration labels
  "vase.clayPot": { vi: "Chậu đất nung", en: "Clay pot" },
  "vase.glassVase": { vi: "Bình thủy tinh", en: "Glass vase" },
  "vase.wovenBasket": { vi: "Giỏ đan", en: "Woven basket" },
  "vase.tinBucket": { vi: "Xô thiếc", en: "Tin bucket" },
  "decoration.none": { vi: "Không có", en: "None" },
  "decoration.sparkle": { vi: "Lấp lánh", en: "Sparkle" },
  "decoration.butterflies": { vi: "Bươm bướm", en: "Butterflies" },
  "decoration.fairyLights": { vi: "Đèn nháy", en: "Fairy lights" },
  "decoration.ribbon": { vi: "Nơ ruy băng", en: "Ribbon" },

  // Frame styles
  "frame.kraftCone": { vi: "Giấy kraft cuộn", en: "Kraft paper cone" },
  "frame.ribbonRound": { vi: "Nơ tròn", en: "Ribbon round" },
  "frame.arch": { vi: "Vòm cổ điển", en: "Classic arch" },
  "frame.hexagon": { vi: "Lục giác", en: "Hexagon" },
  "frame.heart": { vi: "Trái tim", en: "Heart" },
  "frame.classicCircle": { vi: "Hình tròn", en: "Classic circle" },

  // Occasions
  "occasion.Birthday": { vi: "Sinh nhật", en: "Birthday" },
  "occasion.Anniversary": { vi: "Kỷ niệm", en: "Anniversary" },
  "occasion.Graduation": { vi: "Tốt nghiệp", en: "Graduation" },
  "occasion.Thank You": { vi: "Cảm ơn", en: "Thank You" },
  "occasion.Just Because": { vi: "Không cần lý do", en: "Just Because" },
  "occasion.Custom": { vi: "Khác", en: "Custom" },

  // Garden area lock / unlock (multi-map progression)
  "garden.lock.title": { vi: "Khu vườn bí ẩn", en: "A hidden garden" },
  "garden.lock.description": {
    vi: "Hoàn thành khu vườn hiện tại để khám phá nơi này.",
    en: "Complete your current garden to discover this place.",
  },
  "garden.unlock.title": { vi: "Chúc mừng! 🎉", en: "Congratulations! 🎉" },
  "garden.unlock.body": {
    vi: "Bạn đã lấp đầy khu vườn của mình! Đã sẵn sàng để mở khoá",
    en: "You filled up your garden! Ready to unlock",
  },
  "garden.unlock.cta": { vi: "Đến khu vườn", en: "Go to garden" },
  "garden.unlockGate.cta": { vi: "Mở khoá", en: "Unlock" },
  "add.placement.locked.title": { vi: "Khu vườn đang khoá", en: "This garden is locked" },
  "add.placement.locked.body": {
    vi: "Hãy quay lại Khu vườn và bấm mở khoá",
    en: "Go back to Garden and tap unlock on",
  },
  "add.placement.locked.suffix": {
    vi: "trước khi thêm bó hoa mới vào đó.",
    en: "before adding a new bouquet there.",
  },
  "add.placement.locked.cta": { vi: "Đã hiểu", en: "Got it" },
} as const;

export type TranslationKey = keyof typeof dict;

export function translate(key: TranslationKey, language: Language): string {
  const entry = dict[key];
  if (!entry) return key;
  return entry[language] || entry.vi;
}
