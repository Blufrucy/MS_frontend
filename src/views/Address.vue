<template>
  <div class="address-page">
    <div class="page-header">
      <h1>收货地址</h1>
      <el-button type="primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon>
        添加地址
      </el-button>
    </div>

    <div class="address-grid" v-loading="loading">
      <div class="address-card" v-for="addr in addresses" :key="addr.id">
        <div class="address-content">
          <div class="address-header">
            <div class="receiver-info">
              <span class="receiver">{{ addr.receiverName }}</span>
              <span class="phone">{{ addr.phone }}</span>
            </div>
            <el-tag v-if="addr.isDefault === 1" type="success" size="small">默认</el-tag>
          </div>
          
          <div class="address-detail">
            <el-icon class="location-icon"><Location /></el-icon>
            <p class="address-text">
              {{ addr.province }} {{ addr.city }} {{ addr.district }}<br/>
              {{ addr.detailAddress }}
            </p>
          </div>
          
          <div class="actions">
            <el-button type="primary" link @click="editAddress(addr)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(addr.id)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button
              v-if="addr.isDefault !== 1"
              type="success"
              link
              @click="handleSetDefault(addr.id)"
            >
              <el-icon><Star /></el-icon>
              设为默认
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-if="!loading && addresses.length === 0" description="暂无地址" />

    <!-- 添加/编辑地址对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="editingAddress ? '编辑地址' : '添加地址'"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="收货人" prop="receiverName">
          <el-input v-model="form.receiverName" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-input v-model="form.province" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="form.city" />
        </el-form-item>
        <el-form-item label="区县" prop="district">
          <el-input v-model="form.district" />
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model="form.detailAddress" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getAddressList,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '@/api/address'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const showDialog = ref(false)
const addresses = ref([])
const editingAddress = ref(null)
const formRef = ref()

const form = reactive({
  id: null,
  receiverName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false
})

const rules = {
  receiverName: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const fetchAddresses = async () => {
  loading.value = true
  try {
    const res = await getAddressList()
    addresses.value = res.data || []
  } catch (error) {
    ElMessage.error('获取地址列表失败')
  } finally {
    loading.value = false
  }
}

const editAddress = (addr) => {
  editingAddress.value = addr
  // 转换 isDefault 为前端期望的格式（Integer -> boolean）
  Object.assign(form, {
    ...addr,
    isDefault: addr.isDefault === 1
  })
  showDialog.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      // 转换 isDefault 为后端期望的格式（boolean -> Integer）
      const addressData = {
        ...form,
        isDefault: form.isDefault ? 1 : 0
      }
      
      if (editingAddress.value) {
        await updateAddress({ ...addressData, id: editingAddress.value.id })
        ElMessage.success('更新成功')
      } else {
        await addAddress(addressData)
        ElMessage.success('添加成功')
      }
      showDialog.value = false
      resetForm()
      fetchAddresses()
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败，请检查输入信息')
    }
  })
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该地址吗？', '提示', {
      type: 'warning'
    })
    await deleteAddress(id)
    ElMessage.success('删除成功')
    fetchAddresses()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const handleSetDefault = async (id) => {
  try {
    await setDefaultAddress(id)
    ElMessage.success('设置成功')
    fetchAddresses()
  } catch (error) {
    console.error('设置失败:', error)
  }
}

const resetForm = () => {
  editingAddress.value = null
  Object.assign(form, {
    id: null,
    receiverName: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    isDefault: false
  })
}

onMounted(() => {
  fetchAddresses()
})
</script>

<style scoped>
.address-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e4e7ed;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  color: #303133;
  font-weight: 600;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .address-grid {
    grid-template-columns: 1fr;
  }
}

.address-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.address-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #409eff;
}

.address-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.receiver-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.receiver {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.phone {
  font-size: 15px;
  color: #606266;
  margin: 0;
}

.address-detail {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.location-icon {
  font-size: 20px;
  color: #409eff;
  margin-top: 2px;
  flex-shrink: 0;
}

.address-text {
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
  flex: 1;
}

.actions {
  display: flex;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.actions .el-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
