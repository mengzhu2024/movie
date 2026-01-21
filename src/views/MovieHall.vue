<template>
<div>
  <el-form :inline="true" :model="queryParam">
    <el-form-item label="影厅名称">
      <el-input size="small" v-model="queryParam.name" width="370px" />
    </el-form-item>
    <el-form-item label="影厅类别">
      <el-input size="small" v-model="queryParam.category" width="370px" />
    </el-form-item>
    <el-form-item>
      <el-button size="small" type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
      <el-button size="small" type="success" icon="el-icon-plus" @click="toSave({})">新增</el-button>
    </el-form-item>
  </el-form>
  <el-table :data="tableData" border style="width: 100%">
    <el-table-column prop="name" label="影厅名称" align="center" />
    <el-table-column prop="category" label="影厅类别" align="center" />
    <el-table-column prop="rowNums" label="总排数" align="center" />
    <el-table-column prop="seatNumsRow" label="每排的座位数" align="center" />
    <el-table-column prop="seatNums" label="总可用座位数" align="center" />
    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button size="mini" type="primary" @click="toSave(scope.row)"><i class="el-icon-edit" />编辑</el-button>
        <el-button size="mini" type="danger" @click="toDelete(scope.row)"><i class="el-icon-delete" />删除</el-button>
        <el-button size="mini" type="success" @click="toDesign(scope.row)"><i class="el-icon-menu" />安排座位</el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
      style="margin-top: 20px"
      @current-change="handleCurrentChange"
      :total="totalItems"
      layout="total, prev, pager, next"
      :pageSize="10"
      :currentPage="queryParam.current"
  ></el-pagination>
  <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="editDialogFlag" title="编辑影厅" width="600px">
    <el-form ref="saveForm" inline :model="saveForm" :rules="rules" size="small" label-width="120px">
      <el-form-item label="影厅名称" prop="name">
        <el-input size="small" v-model="saveForm.name" style="width: 400px" />
      </el-form-item>
      <el-form-item label="影厅类别" prop="category">
        <el-input size="small" v-model="saveForm.category" style="width: 400px" />
      </el-form-item>
      <el-form-item label="总排数" prop="rowNums">
        <el-input-number size="small" v-model="saveForm.rowNums" style="width: 400px" :min="5" :max="50"/>
      </el-form-item>
      <el-form-item label="每排的座位数" prop="seatNumsRow">
        <el-input-number size="small" v-model="saveForm.seatNumsRow" style="width: 400px" :min="5" :max="50"/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="editDialogFlag = false">取消</el-button>
      <el-button :loading="editLoading" type="primary" @click="save">确认</el-button>
    </div>
  </el-dialog>
  <!--安排座位对话框-->
  <el-dialog title="安排座位" :visible.sync="editDialogFlag2" :width="(200 + 40* this.saveForm.seatNumsRow) + 'px'">
    <div style="display:flex; align-content: center">
      <span style="margin-right: 50px">启用</span>
      <span class="seat" :class="isSelected[0]"></span>
      <span style="margin: 0 50px">禁用</span>
      <span class="seat" :class="isSelected[1]"></span>
    </div>
    <br/>
    <div class="row" v-for="(value, key) in seats" :key="generateRandomString(10)">
      <div style="justify-content: flex-end;">
          <span class="seat" :class="isSelected[seats[key][index]]" :key="generateRandomString(10)" @click="pressSeat(key, index)" v-for="(item, index) in value">
          </span>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogFlag2 = false" style="font-size: 18px;"><i class="iconfont icon-r-left" style="font-size: 24px;"></i> 取 消</el-button>
        <el-button type="primary" @click="design" style="font-size: 18px;"><i class="iconfont icon-r-yes" style="font-size: 24px;"></i> 确 定</el-button>
      </span>
  </el-dialog>
</div>
</template>

<script>
import {downloadFile} from "@/utils/download";
export default {
  data() {
    return {
      tableData: [],
      totalItems: null,
      queryParam: {
        current: 1,
      },
      seats: {},
      saveForm: {},
      editLoading: false,
      editDialogFlag: false,
      editDialogFlag2: false,
      rules: {
        name: [
          { required: true, message: '影厅名称不能为空', trigger: 'change' }
        ],
        category: [
          { required: true, message: '影厅类别不能为空', trigger: 'change' }
        ],
        rowNums: [
          { required: true, message: '总排数不能为空', trigger: 'change' }
        ],
        seatNumsRow: [
          { required: true, message: '每排的座位数不能为空', trigger: 'change' }
        ],
      },
      loginer: {},
      isSelected: {
        0: 'seat-default',
        1: 'seat-choose'
      },
    }
  },

  created() {
    this.getList()
    this.$axios({
      url: '/api/loginer',
      method: 'get',
    }).then(res => {
      this.loginer = res.data.data || {}
    })
  },

  methods: {
    // 获取随机的key
    generateRandomString(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    },
    handleCurrentChange(page) {
      this.queryParam.current = page
      this.getList()
    },
    getList() {
      this.$axios({
        url: '/api/movie-hall/page',
        method: 'post',
        data: this.queryParam
      }).then(res => {
        this.tableData = res.data.data.records
        this.totalItems = res.data.data.total
      })
    },
    toSave(data) {
      this.saveForm = data
      if (!this.saveForm.id) {
        this.saveForm.rowNums = 10
        this.saveForm.seatNumsRow = 18
      }
      this.editDialogFlag = true
      this.$nextTick(() => {
        this.$refs.saveForm.clearValidate()
      })
    },
    save() {
      this.$refs.saveForm.validate(res => {
        let row = this.saveForm.rowNums
        let col = this.saveForm.seatNumsRow
        let oldSeatState = this.saveForm.seatState? JSON.parse(this.saveForm.seatState) : {}
        this.saveForm.seatState = {}
        let disableNum = 0
        for (let i = 0; i < row; i++) {
          let arr = []
          for (let j = 0; j < col; j++) {
            let status = oldSeatState[i] && oldSeatState[i][j]? oldSeatState[i][j]: 0
            arr.push(status)
            disableNum += status
          }
          this.saveForm.seatState[i] = arr
        }
        this.saveForm.seatNums = row * col - disableNum
        this.saveForm.seatState = JSON.stringify(this.saveForm.seatState)
        if (res) {
          this.$axios({
            url: this.saveForm.id ? '/api/movie-hall/update': '/api/movie-hall/add',
            method: 'post',
            data: this.saveForm
          }).then(res => {
            if (res.data.code === 0) {
              this.$message.success('保存成功');
              this.editDialogFlag = false
              this.getList()
            } else {
              this.$message.error(res.data.msg);
            }
          })
        }
      })
    },
    toDesign(row) {
      this.saveForm = row
      this.seats = JSON.parse(row.seatState)
      this.editDialogFlag2 = true
    },
    design() {
      let row = this.saveForm.rowNums
      let col = this.saveForm.seatNumsRow
      let disableNum = 0
      for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
          disableNum += this.seats[i][j]
        }
      }
      this.saveForm.seatNums = row * col - disableNum
      this.$axios({
        url: '/api/movie-hall/update',
        method: 'post',
        data: {id: this.saveForm.id, seatState: JSON.stringify(this.seats), seatNums: this.saveForm.seatNums}
      }).then(res => {
        if (res.data.code === 0) {
          this.$message.success('保存成功');
          this.editDialogFlag2 = false
          this.getList()
        } else {
          this.$message.error(res.data.msg);
        }
      })
    },
    toDelete(row) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios({
          url: '/api/movie-hall/delete?id=' + row.id,
          method: 'delete'
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('删除成功');
            this.getList()
          } else {
            this.$message.error(res.data.msg);
          }
        })
      }).catch(e => {})
    },
    pressSeat(key, idx){
      this.$set(this.seats[key], idx, (this.seats[key][idx] === 0 ? 1 : 0))
    },
    downloadAttach(url, name) {
      downloadFile(url, name)
    },
    handleExceed(files, fileList) {
      this.$message.error('最多只能上传一个文件');
    },
  }
}
</script>
<style scoped>
.avatar {
  display: inline-block;
  width: 200px;
  height: 200px;
  float: right;
}
.seat{
  display: inline-block;
  width: 30px;
  height: 26px;
  margin: 0 5px;
  background-position: 0 1px;
}
.seat-default {
  background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAHKSURBVEhLxZfbysIwDMezKeJUVAR9A/H9X0FQZMOLeem14sWc4AnP9muybM4557eT/mCYdLT/tknaqQgJ/ACVf7/Oz4TfbvVisYDlcgm1Wg2SRON0OoGqqtDr9bglAAoHGY1GQgqzl5zz+SyGwyF7z7wITyYTtrJD13W2HrzEuFqtspUdnU4Hbrcbew5fSa5SqfQbYbmzoCgKew5fK6disciWgyd8vV5hPB5DoVAA27bpSct6vQbLsmjFhmFwK0MpJjFNky2H3W4nZEf24rPZbMTlcmFPiPv9LgaDAXu+rNY0jS0HzG5Zh+zFRwo9bS/GuNvtgpwM+SQsVwetVosa/GDnpMhFsfUAJ3I4HMgmYRQIZl1awsbzTyYyqzHRkhK2Yj+RwklwBYMHRpDMhd0tTrXiT52jwCsxCrqPZc3RARLM7O1266V/XMrlMlQqFfYcVqsVZXa9Xo8Wzhq/cOYx/i+e8KeYZIFfgyyMxWw2o4Y8mc/nXty9jz08NqfTKTSbTapBLAt8kh6buDocGh+3xNrtNjQaDbLxRSj7/f7pNolLv98Xx+ORvVfeBla+S3VJ4K7hGO/I7S8MDht2UbjklspRokj+NRQKwB/pWISi3oSUQQAAAABJRU5ErkJggg==") no-repeat;
}
.seat-choose{
  background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAKVSURBVEhLxZXPThpRFMY/hhFBG4okbdiYxgXpxmJi0phi4sKlL+HWlSsfwMSFr+DKjSufwMSFiyakaaagQaOxW1txUUjDHwVh5vacmdtxgGEsA1N/yYHLvdzzzT33nDMhQeAFUOT3f+fFhAeGutRs4tfpKV5dXECoqpz9R8hlKxqFsrqK96mUnOzGVfhrsYh3+/tIXV8Dk5Nydkh0HW3a+21zE59WVuTkE33C5/k8PmxvW4ITE/SPkFzxQacDUOS0nR18XFiQkxZ9dzx9dARwaCOR0UQZ9kP29vAQupz6S39y8UmVMeZcOIwInfp54QAQdJDe2LkLt9tAq2Vmp294L/vhe6Zxb13YwrSMvKZRZMIoLy2hvLYG3N/7E+c9FN7f2SzK8/MQiQS0szO5aGFndfHkBJndXSAeNzc2ZmehUw3GCwUru4eBTlpbXETs6grqwwNgGBBkX7a2kF1eNv9inziWy1minFxU/NM3N2jHYr5PbJAPtdGwHpp8hiiS6YMDUPBNTOE6WfL21sxAGx7Xav5KivaIx0fy7kghGqv0QHR+6yd/GGQUcx52M0Idu+0UDn+ORxovLp24i8CEO9SrvQhM+LlL8hQWnJHcBHxYiKvDA7OOqzTobGwgWalYjZ2hjlObm0N7Zmb4kqIkipZKmLq7e6oU8ldJJqHu7YGK1kOYke3OF1xKzvLsEfa+Y34IDrcfc4q6YAsrfDcBozgy3RSeIvuRyVidinsrNfixW7WKn+m0qcXYLwlum9+Pj5G4vITO709KEDaDmrsfFPLBrtnMrkhvqDfr63gt13nBlYZhiFyhIH8Nz2dNE005dmNgcgl6Fxv8dvGJXq9DcIgHYId63LBbvqpBeJfTCHiJMoEJewP8Afy6sw903o8jAAAAAElFTkSuQmCC") no-repeat;
}
</style>
